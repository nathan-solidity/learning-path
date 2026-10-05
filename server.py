from flask import Flask, jsonify, send_from_directory, abort, request
import os
import re
import markdown as md

try:
    from dotenv import load_dotenv
    _env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    load_dotenv(_env_path)
except ImportError:
    pass

try:
    from google import genai
except ImportError:
    genai = None

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TRACKS_DIR = os.path.join(BASE_DIR, "tracks")
IMAGES_DIR = os.path.join(BASE_DIR, "images")
VENDOR_DIR = os.path.join(BASE_DIR, "vendor")

GEMINI_MODEL = os.environ.get("GEMINI_MODEL") or "gemini-3.6-flash"

_gemini_client = None
_gemini_key_used = None


def get_gemini_client():
    """Client dùng GEMINI_API_KEY của server — chỉ là fallback khi chạy local."""
    global _gemini_client, _gemini_key_used
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or not genai:
        return None
    if _gemini_client is None or api_key != _gemini_key_used:
        try:
            _gemini_client = genai.Client(api_key=api_key)
            _gemini_key_used = api_key
        except Exception as e:
            print(f"[server] Gemini API init failed: {e}")
            _gemini_client = None
    return _gemini_client


def run_llm(prompt, user_key=None):
    """Gọi Gemini. Ưu tiên key người dùng gửi lên (BYOK).

    Key người dùng chỉ sống trong request này: tạo client riêng, không cache, không log —
    tránh dùng nhầm key giữa các request chạy song song.
    """
    if user_key:
        if not genai:
            raise RuntimeError("Server chưa cài google-genai (pip install -r requirements.txt)")
        client = genai.Client(api_key=user_key)
    else:
        client = get_gemini_client()
    if not client:
        raise RuntimeError(
            "Chưa có Gemini API key. Bấm 🔑 trong panel Hỏi thêm để nhập key của bạn "
            "(tạo miễn phí tại https://aistudio.google.com/apikey)."
        )
    response = client.models.generate_content(model=GEMINI_MODEL, contents=prompt)
    text = (response.text or "").strip()
    if not text:
        raise RuntimeError("Gemini API không trả về nội dung text")
    return text


def _render_untrusted_md(text):
    """Render markdown từ nguồn không tin cậy (câu trả lời LLM) — HTML thô hiện thành text.

    Câu trả lời về bảo mật hay chứa `<script>`, `<img onerror=...>` ngoài code block; nếu để
    Markdown giữ nguyên HTML thì chúng chạy được trên trang (XSS). Client sanitize thêm 1 lớp.
    """
    m = md.Markdown(extensions=["fenced_code", "tables", "sane_lists"])
    m.preprocessors.deregister("html_block")
    m.inlinePatterns.deregister("html")
    return m.convert(text)

# Nhãn level mặc định nếu track không định nghĩa
DEFAULT_LEVELS = [
    {"key": "basic", "title": "Cơ bản"},
    {"key": "intermediate", "title": "Trung cấp"},
    {"key": "advanced", "title": "Nâng cao"},
]


def _parse_frontmatter(text):
    """Parse YAML frontmatter đơn giản.

    Hỗ trợ:
      key: value
      key: "value"
      key: [a, b, c]            (inline list)
      key:                       (block list)
        - item 1
        - item 2
      key:                       (block list of dict — chỉ 1 tầng)
        - subkey: v
          subkey2: v
    """
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", text, re.DOTALL)
    if not m:
        return {}, text.strip()
    raw_meta, body = m.group(1), m.group(2)

    meta = {}
    lines = raw_meta.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            i += 1
            continue

        indent = len(line) - len(line.lstrip())
        if indent > 0 or ":" not in stripped:
            # Dòng con lạc ngữ cảnh — bỏ qua, đã xử lý ở block bên dưới
            i += 1
            continue

        key, _, value = stripped.partition(":")
        key = key.strip()
        value = value.strip()

        if value:
            meta[key] = _scalar(value)
            i += 1
            continue

        # Block: nhìn các dòng con thụt lề tiếp theo
        i += 1
        block_items = []
        while i < len(lines):
            sub = lines[i]
            if not sub.strip():
                i += 1
                continue
            sub_indent = len(sub) - len(sub.lstrip())
            if sub_indent == 0:
                break
            sub_stripped = sub.strip()
            if sub_stripped.startswith("- "):
                item_val = sub_stripped[2:].strip()
                if ":" in item_val and not (item_val.startswith('"') or item_val.startswith("'")):
                    # phần tử dạng dict (1 tầng) — gom các dòng cùng cấp
                    d = {}
                    k2, _, v2 = item_val.partition(":")
                    d[k2.strip()] = _scalar(v2.strip())
                    item_indent = sub_indent
                    i += 1
                    while i < len(lines):
                        nxt = lines[i]
                        if not nxt.strip():
                            i += 1
                            continue
                        nxt_indent = len(nxt) - len(nxt.lstrip())
                        nxt_stripped = nxt.strip()
                        if nxt_indent <= item_indent or nxt_stripped.startswith("- "):
                            break
                        if ":" in nxt_stripped:
                            k3, _, v3 = nxt_stripped.partition(":")
                            d[k3.strip()] = _scalar(v3.strip())
                        i += 1
                    block_items.append(d)
                else:
                    block_items.append(_scalar(item_val))
                    i += 1
            else:
                i += 1
        meta[key] = block_items
    return meta, body.strip()


def _scalar(value):
    value = value.strip()
    if len(value) >= 2 and value[0] in "\"'" and value[-1] == value[0]:
        return value[1:-1]
    if value.startswith("[") and value.endswith("]"):
        return [x.strip().strip("\"'") for x in value[1:-1].split(",") if x.strip()]
    return value


def _load_tracks():
    tracks = {}
    if not os.path.isdir(TRACKS_DIR):
        return tracks

    for track_key in sorted(os.listdir(TRACKS_DIR)):
        track_path = os.path.join(TRACKS_DIR, track_key)
        if not os.path.isdir(track_path):
            continue

        meta_file = os.path.join(track_path, "_track.md")
        track_meta, track_body = {}, ""
        if os.path.isfile(meta_file):
            with open(meta_file, "r", encoding="utf-8") as f:
                track_meta, track_body = _parse_frontmatter(f.read())

        levels = track_meta.get("levels") or DEFAULT_LEVELS
        # Chuẩn hóa levels thành list dict {key,title,desc}
        norm_levels = []
        for lv in levels:
            if isinstance(lv, dict):
                norm_levels.append({
                    "key": lv.get("key", ""),
                    "title": lv.get("title", lv.get("key", "")),
                    "desc": lv.get("desc", ""),
                })
        if not norm_levels:
            norm_levels = DEFAULT_LEVELS

        topics = []
        for fn in sorted(os.listdir(track_path)):
            if not fn.endswith(".md") or fn == "_track.md":
                continue
            with open(os.path.join(track_path, fn), "r", encoding="utf-8") as f:
                tmeta, tbody = _parse_frontmatter(f.read())
            checklist = tmeta.get("checklist") or []
            if isinstance(checklist, str):
                checklist = [checklist]
            related = tmeta.get("related") or []
            if isinstance(related, str):
                related = [related]
            try:
                order = int(tmeta.get("order", 999))
            except (TypeError, ValueError):
                order = 999
            topics.append({
                "id": fn[:-3],
                "level": tmeta.get("level", ""),
                "order": order,
                "title": tmeta.get("title", fn[:-3]),
                "est": tmeta.get("est", ""),
                "checklist": checklist,
                "related": related,
                "body_md": tbody,
            })

        topics.sort(key=lambda t: t["order"])

        coming = track_meta.get("coming_soon")
        coming_soon = str(coming).lower() in ("1", "true", "yes") if coming else False

        tracks[track_key] = {
            "key": track_key,
            "role": track_meta.get("role", track_key),
            "title": track_meta.get("title", track_key.upper()),
            "icon": track_meta.get("icon", "📚"),
            "summary": track_meta.get("summary", ""),
            "group": track_meta.get("group", ""),
            "group_title": track_meta.get("group_title", ""),
            "group_icon": track_meta.get("group_icon", ""),
            "group_summary": track_meta.get("group_summary", ""),
            "variant": track_meta.get("variant", ""),
            "variant_desc": track_meta.get("variant_desc", ""),
            "coming_soon": coming_soon,
            "levels": norm_levels,
            "intro_md": track_body,
            "topics": topics,
        }
    return tracks


_TRACKS_CACHE = _load_tracks()


def _tracks():
    return _TRACKS_CACHE


def _total_checklist(track):
    return sum(len(t["checklist"]) for t in track["topics"])


@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/images/<path:filename>")
def serve_image(filename):
    return send_from_directory(IMAGES_DIR, filename)


@app.route("/vendor/<path:filename>")
def serve_vendor(filename):
    """Serve thư viện tĩnh (sql.js wasm) cho SQL Playground — chạy client-side."""
    resp = send_from_directory(VENDOR_DIR, filename)
    # wasm cần content-type đúng; JS demo/playground không cache để cập nhật ngay
    if filename.endswith(".js"):
        resp.headers["Cache-Control"] = "no-cache"
    return resp


def _track_summary(tr):
    """Thông tin tóm tắt 1 track (dùng cho card survey và variant)."""
    return {
        "key": tr["key"],
        "role": tr["role"],
        "title": tr["title"],
        "icon": tr["icon"],
        "summary": tr["summary"],
        "variant": tr["variant"],
        "variant_desc": tr["variant_desc"],
        "coming_soon": tr["coming_soon"],
        "level_count": len(tr["levels"]),
        "topic_count": len(tr["topics"]),
        "checklist_count": _total_checklist(tr),
    }


@app.route("/api/tracks")
def api_tracks():
    """Danh sách cho màn survey — gom các track cùng `group` thành 1 vai trò.

    Trả về list gồm 2 kiểu entry:
      - kind="track": vai trò đơn (1 lộ trình), vd BA.
      - kind="group": vai trò có nhiều nhánh (variant), vd Dev → Ruby on Rails / Java.
    """
    groups = {}          # group_key -> entry gom nhóm
    result = []

    for tr in _tracks().values():
        grp = tr.get("group")
        if grp:
            g = groups.get(grp)
            if not g:
                g = {
                    "kind": "group",
                    "group": grp,
                    "title": tr["group_title"] or grp.upper(),
                    "icon": tr["group_icon"] or "📚",
                    "summary": tr["group_summary"] or "",
                    "variants": [],
                }
                groups[grp] = g
                result.append(g)
            g["variants"].append(_track_summary(tr))
        else:
            entry = _track_summary(tr)
            entry["kind"] = "track"
            result.append(entry)

    # Group coming_soon nếu MỌI variant đều coming_soon (hoặc rỗng)
    for g in groups.values():
        g["variants"].sort(key=lambda v: (v["coming_soon"], v["title"]))
        g["coming_soon"] = all(v["coming_soon"] for v in g["variants"]) if g["variants"] else True
        g["variant_count"] = len(g["variants"])

    # Chưa ra mắt xuống cuối, còn lại theo title
    result.sort(key=lambda e: (e.get("coming_soon", False), e["title"]))
    return jsonify(result)


@app.route("/api/track/<track_key>")
def api_track(track_key):
    """Chi tiết một track: levels + topics (kèm nội dung HTML + checklist)."""
    tr = _tracks().get(track_key)
    if not tr:
        abort(404)

    topics = []
    for t in tr["topics"]:
        topics.append({
            "id": t["id"],
            "level": t["level"],
            "order": t["order"],
            "title": t["title"],
            "est": t["est"],
            "checklist": t["checklist"],
            "related": t["related"],
            "html": md.markdown(t["body_md"], extensions=["fenced_code", "tables", "sane_lists"]),
        })

    return jsonify({
        "key": tr["key"],
        "role": tr["role"],
        "title": tr["title"],
        "icon": tr["icon"],
        "summary": tr["summary"],
        "levels": tr["levels"],
        "intro_html": md.markdown(tr["intro_md"], extensions=["fenced_code", "tables", "sane_lists"]),
        "topics": topics,
        "checklist_count": _total_checklist(tr),
    })


ASK_PROMPT_TEMPLATE = """Bạn là trợ lý học tập, kèm cặp người học theo lộ trình đào tạo
vai trò dự án phần mềm (BA, Dev, QA, PM...). Dưới đây là nội dung các bài học trong lộ
trình mà người dùng đang theo. Mỗi bài có một id định danh trong ngoặc vuông ở đầu heading,
ví dụ [id: 12-sql-basics]:

{context}

---

Câu hỏi của người học: {question}

Hãy trả lời dựa trên nội dung các bài học ở trên nếu có liên quan — nhắc rõ bài nào liên
quan trực tiếp để họ đọc kỹ lại. Nếu câu hỏi nằm ngoài phạm vi các bài học trên, hãy nói
rõ "Nội dung này chưa có trong lộ trình" trước khi trả lời bằng kiến thức chung — không
trình bày kiến thức chung như thể đã có sẵn trong lộ trình. Trả lời ngắn gọn, đi thẳng vào
vấn đề, dùng tiếng Việt, giữ nguyên thuật ngữ kỹ thuật tiếng Anh. Ưu tiên giải thích để
người học HIỂU, cho ví dụ cụ thể khi cần.

Sau khi trả lời xong, thêm 1 dòng cuối cùng theo đúng định dạng sau (kể cả khi rỗng):
RELATED_TOPICS: id-1, id-2"""


@app.route("/api/ask", methods=["POST"])
def api_ask():
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    track_key = data.get("track")

    if not question:
        return jsonify({"error": "Thiếu câu hỏi"}), 400

    tr = _tracks().get(track_key)
    topics = tr["topics"] if tr else [t for track in _tracks().values() for t in track["topics"]]
    if not topics:
        return jsonify({"error": "Không có nội dung bài học"}), 400

    context_parts = []
    for t in topics:
        context_parts.append(f"## [id: {t['id']}] {t['title']}\n{t['body_md']}")
    context = "\n\n".join(context_parts)

    prompt = ASK_PROMPT_TEMPLATE.format(context=context, question=question)

    # Key của người dùng (BYOK) — chỉ dùng cho request này, KHÔNG log/lưu
    user_key = (request.headers.get("X-Gemini-Key") or "").strip()
    if user_key and (len(user_key) > 200 or not re.fullmatch(r"[A-Za-z0-9_\-]+", user_key)):
        return jsonify({"error": "Gemini API key không đúng định dạng"}), 400

    try:
        raw_answer = run_llm(prompt, user_key=user_key or None)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    valid_ids = {t["id"] for t in topics}
    answer = raw_answer
    related_topics = []

    match = re.search(r"RELATED_TOPICS:\s*(.*)\s*$", raw_answer, re.IGNORECASE)
    if match:
        answer = raw_answer[:match.start()].strip()
        candidates = [s.strip() for s in match.group(1).split(",") if s.strip()]
        related_topics = [s for s in candidates if s in valid_ids]

    answer_html = _render_untrusted_md(answer)

    return jsonify({"answer": answer, "answer_html": answer_html, "related_topics": related_topics})


@app.route("/api/reload", methods=["POST"])
def api_reload():
    global _TRACKS_CACHE
    _TRACKS_CACHE = _load_tracks()
    return jsonify({"reloaded": True, "tracks": len(_TRACKS_CACHE)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5032))
    app.run(host="0.0.0.0", port=port)
