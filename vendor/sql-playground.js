// SQL Playground — chạy query THẬT bằng sql.js (SQLite biên dịch WebAssembly),
// hoàn toàn client-side. Lệnh ghi (UPDATE/DELETE/INSERT/DROP...) CHỈ được mô phỏng
// "dự kiến ảnh hưởng N dòng", KHÔNG thực thi — dữ liệu demo luôn nguyên vẹn.
(function () {
  let dbPromise = null;   // Promise<Database> — khởi tạo 1 lần
  let SQL = null;

  const WRITE_RE = /^\s*(update|delete|insert|drop|alter|create|truncate|replace|merge)\b/i;

  // Nạp sql.js + dựng DB demo (lazy, chỉ khi mở playground lần đầu)
  function initDb() {
    if (dbPromise) return dbPromise;
    dbPromise = (async () => {
      // initSqlJs được cung cấp bởi vendor/sql-wasm.js
      SQL = await initSqlJs({ locateFile: () => "/vendor/sql-wasm.wasm" });
      const db = new SQL.Database();
      db.run(window.SQL_DEMO.schemaSql);
      return db;
    })();
    return dbPromise;
  }

  // Chạy 1 query đọc trên bản sao dữ liệu (không đụng DB gốc)
  async function runReadOnly(sql) {
    const db = await initDb();
    const res = db.exec(sql); // trả [{columns, values}], có thể rỗng nếu không có kết quả
    return res;
  }

  // Với lệnh ghi: chạy thử trên DB TẠM (bản sao) để đếm số dòng ảnh hưởng, rồi vứt đi
  async function previewWrite(sql) {
    await initDb();
    const tmp = new SQL.Database();
    tmp.run(window.SQL_DEMO.schemaSql);
    let affected = 0;
    try {
      tmp.run(sql);
      affected = tmp.getRowsModified();
    } catch (e) {
      tmp.close();
      throw e;
    }
    tmp.close();
    return affected;
  }

  function esc(v) {
    if (v === null || v === undefined) return '<span class="pg-null">NULL</span>';
    return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ---- Chế độ "duyệt bảng": bấm bảng bên trái → SELECT * FROM t, có sort/filter trên header ----
  let browse = null; // { table, sort:{col,dir}|null, filters:[{col,op,val}] }

  // Toán tử filter theo kiểu cột
  const OPS_COMMON = [
    { op: "IS NULL", label: "trống (NULL)", noVal: true },
    { op: "IS NOT NULL", label: "khác trống", noVal: true },
  ];
  const OPS_NUM = [
    { op: "=", label: "= bằng" }, { op: "<>", label: "≠ khác" },
    { op: ">", label: "> lớn hơn" }, { op: ">=", label: "≥ lớn/bằng" },
    { op: "<", label: "< nhỏ hơn" }, { op: "<=", label: "≤ nhỏ/bằng" },
  ];
  const OPS_TEXT = [
    { op: "=", label: "= bằng đúng" }, { op: "<>", label: "≠ khác" },
    { op: "contains", label: "chứa" }, { op: "starts", label: "bắt đầu bằng" },
    { op: "ends", label: "kết thúc bằng" },
  ];
  function opsFor(colType) {
    const isNum = /INT|REAL|NUM|DEC|FLOAT|DOUBLE/i.test(colType || "");
    return (isNum ? OPS_NUM : OPS_TEXT).concat(OPS_COMMON);
  }
  function colType(table, col) {
    const t = window.SQL_DEMO.tables.find((x) => x.name === table);
    const c = t && t.columns.find((x) => x.name === col);
    return c ? c.type : "TEXT";
  }

  function sqlLiteral(col, type, val) {
    const isNum = /INT|REAL|NUM|DEC|FLOAT|DOUBLE/i.test(type || "");
    if (isNum && val !== "" && !isNaN(val)) return String(Number(val));
    return "'" + String(val).replace(/'/g, "''") + "'"; // escape nháy đơn
  }
  function filterToSql(f) {
    const type = colType(browse.table, f.col);
    if (f.op === "IS NULL") return `${f.col} IS NULL`;
    if (f.op === "IS NOT NULL") return `${f.col} IS NOT NULL`;
    if (f.op === "contains") return `${f.col} LIKE '%${String(f.val).replace(/'/g, "''")}%'`;
    if (f.op === "starts") return `${f.col} LIKE '${String(f.val).replace(/'/g, "''")}%'`;
    if (f.op === "ends") return `${f.col} LIKE '%${String(f.val).replace(/'/g, "''")}'`;
    return `${f.col} ${f.op} ${sqlLiteral(f.col, type, f.val)}`;
  }
  function buildBrowseSql() {
    let sql = `SELECT * FROM ${browse.table}`;
    if (browse.filters.length) {
      sql += "\nWHERE " + browse.filters.map(filterToSql).join("\n  AND ");
    }
    if (browse.sort) sql += `\nORDER BY ${browse.sort.col} ${browse.sort.dir}`;
    return sql + ";";
  }
  async function runBrowse() {
    const sql = buildBrowseSql();
    document.getElementById("pgSql").value = sql; // cho học viên thấy SQL do UI sinh ra
    try {
      const res = await runReadOnly(sql);
      renderResult(res, true);
    } catch (e) {
      document.getElementById("pgResult").innerHTML = `<div class="pg-err">Lỗi SQL: ${esc(e.message)}</div>`;
    }
  }
  function browseTable(name) {
    browse = { table: name, sort: null, filters: [] };
    runBrowse();
  }

  function renderResult(res, browsing) {
    const out = document.getElementById("pgResult");
    closeFilterPopup();
    if (!res || !res.length) {
      out.innerHTML = '<div class="pg-msg">Truy vấn chạy xong — không có dòng nào trả về.</div>' +
        (browsing ? filterChipsHtml() : "");
      if (browsing) wireHeader([]);
      return;
    }
    const { columns, values } = res[0];
    let html = "";
    if (browsing) html += filterChipsHtml();
    html += '<div class="pg-table-wrap"><table class="pg-table"><thead><tr>';
    html += columns.map((c) => {
      if (!browsing) return `<th>${esc(c)}</th>`;
      const s = browse.sort && browse.sort.col === c ? (browse.sort.dir === "ASC" ? " ▲" : " ▼") : "";
      const active = browse.filters.some((f) => f.col === c) ? " pg-th-filtered" : "";
      return `<th class="pg-th${active}"><span class="pg-th-name" data-sort="${esc(c)}">${esc(c)}${s}</span>` +
        `<button class="pg-th-fil" data-fil="${esc(c)}" title="Lọc cột ${esc(c)}">▾</button></th>`;
    }).join("");
    html += "</tr></thead><tbody>";
    values.forEach((row) => {
      html += "<tr>" + row.map((v) => `<td>${esc(v)}</td>`).join("") + "</tr>";
    });
    html += "</tbody></table></div>";
    html += `<div class="pg-msg pg-ok">✓ ${values.length} dòng · ${columns.length} cột` +
      (browsing ? ` · bảng <b>${esc(browse.table)}</b> (bấm tên cột để sắp xếp, ▾ để lọc)` : "") + "</div>";
    out.innerHTML = html;
    if (browsing) wireHeader(columns);
  }

  function filterChipsHtml() {
    if (!browse || !browse.filters.length) return "";
    const chips = browse.filters.map((f, i) => {
      const txt = f.op === "IS NULL" ? `${f.col} trống`
        : f.op === "IS NOT NULL" ? `${f.col} khác trống`
        : f.op === "contains" ? `${f.col} chứa "${f.val}"`
        : f.op === "starts" ? `${f.col} bắt đầu "${f.val}"`
        : f.op === "ends" ? `${f.col} kết thúc "${f.val}"`
        : `${f.col} ${f.op} ${f.val}`;
      return `<span class="pg-chip">${esc(txt)}<button data-rmf="${i}" title="Bỏ lọc">✕</button></span>`;
    }).join("");
    return `<div class="pg-chips">Đang lọc: ${chips} <button class="pg-chip-clear" data-clearf="1">Xóa tất cả</button></div>`;
  }

  function wireHeader(columns) {
    const out = document.getElementById("pgResult");
    out.querySelectorAll("[data-sort]").forEach((el) =>
      el.addEventListener("click", () => {
        const c = el.getAttribute("data-sort");
        if (!browse.sort || browse.sort.col !== c) browse.sort = { col: c, dir: "ASC" };
        else if (browse.sort.dir === "ASC") browse.sort.dir = "DESC";
        else browse.sort = null; // vòng: ASC → DESC → bỏ sort
        runBrowse();
      })
    );
    out.querySelectorAll("[data-fil]").forEach((el) =>
      el.addEventListener("click", (ev) => { ev.stopPropagation(); openFilterPopup(el.getAttribute("data-fil"), el); })
    );
    out.querySelectorAll("[data-rmf]").forEach((el) =>
      el.addEventListener("click", () => { browse.filters.splice(+el.getAttribute("data-rmf"), 1); runBrowse(); })
    );
    out.querySelectorAll("[data-clearf]").forEach((el) =>
      el.addEventListener("click", () => { browse.filters = []; runBrowse(); })
    );
  }

  // ---- Popup filter cho 1 cột ----
  function closeFilterPopup() {
    const p = document.getElementById("pgFilterPop");
    if (p) p.remove();
  }
  function openFilterPopup(col, anchor) {
    closeFilterPopup();
    const type = colType(browse.table, col);
    const ops = opsFor(type);
    const existing = browse.filters.find((f) => f.col === col);
    const pop = document.createElement("div");
    pop.id = "pgFilterPop";
    pop.className = "pg-filpop";
    pop.innerHTML =
      `<div class="pg-filpop-hd">Lọc cột <b>${esc(col)}</b> <i>${esc(type)}</i></div>` +
      `<select id="pgFilOp">${ops.map((o) =>
        `<option value="${o.op}" ${existing && existing.op === o.op ? "selected" : ""}>${o.label}</option>`).join("")}</select>` +
      `<input id="pgFilVal" type="text" placeholder="giá trị…" value="${existing ? esc(existing.val || "") : ""}">` +
      `<div class="pg-filpop-btns"><button id="pgFilApply" class="pg-run">Áp dụng</button>` +
      `<button id="pgFilCancel" class="icon-btn">Hủy</button></div>`;
    document.body.appendChild(pop);
    // đặt popup gần nút bấm
    const r = anchor.getBoundingClientRect();
    pop.style.left = Math.min(r.left, window.innerWidth - 250) + "px";
    pop.style.top = (r.bottom + 4) + "px";

    const opSel = pop.querySelector("#pgFilOp");
    const valInput = pop.querySelector("#pgFilVal");
    function syncValState() {
      const o = ops.find((x) => x.op === opSel.value);
      valInput.style.display = o && o.noVal ? "none" : "block";
    }
    syncValState();
    opSel.onchange = syncValState;
    valInput.focus();
    valInput.onkeydown = (e) => { if (e.key === "Enter") pop.querySelector("#pgFilApply").click(); };

    pop.querySelector("#pgFilCancel").onclick = closeFilterPopup;
    pop.querySelector("#pgFilApply").onclick = () => {
      const o = ops.find((x) => x.op === opSel.value);
      const val = valInput.value.trim();
      if (!o.noVal && val === "") { valInput.focus(); return; }
      const f = { col, op: opSel.value, val: o.noVal ? "" : val };
      const idx = browse.filters.findIndex((x) => x.col === col);
      if (idx >= 0) browse.filters[idx] = f; else browse.filters.push(f);
      closeFilterPopup();
      runBrowse();
    };
  }
  // đóng popup khi bấm ra ngoài
  document.addEventListener("click", (e) => {
    const p = document.getElementById("pgFilterPop");
    if (p && !p.contains(e.target) && !(e.target.getAttribute && e.target.getAttribute("data-fil"))) closeFilterPopup();
  });

  // Bảng danh sách + ERD text đơn giản
  function renderSchema() {
    const box = document.getElementById("pgSchema");
    let html = '<div class="pg-schema-title">5 bảng demo — bấm tên bảng để xem dữ liệu, bấm cột để chèn vào query</div>';
    window.SQL_DEMO.tables.forEach((t) => {
      html += `<div class="pg-tbl"><div class="pg-tbl-name" data-tbl="${t.name}" title="Xem dữ liệu bảng ${t.name}">🗂 ${t.name}` +
        `<span class="pg-tbl-desc">${t.desc}</span></div><div class="pg-cols">`;
      html += t.columns
        .map((c) => {
          const badge = c.key ? `<span class="pg-key">${c.key}</span>` : "";
          const ref = c.ref ? `<span class="pg-ref">→ ${c.ref}</span>` : "";
          return `<span class="pg-col" data-col="${c.name}">${c.name} <i>${c.type}</i>${badge}${ref}</span>`;
        })
        .join("");
      html += "</div></div>";
    });
    html += '<div class="pg-rel-title">Quan hệ</div><div class="pg-rels">';
    window.SQL_DEMO.relations.forEach((r) => {
      html += `<span class="pg-rel"><b>${r.kind}</b> ${r.from} → ${r.to}</span>`;
    });
    html += "</div>";
    box.innerHTML = html;

    // Bấm TÊN BẢNG → xem dữ liệu bảng đó (có sort/filter). Bấm CỘT → chèn tên vào query.
    box.querySelectorAll("[data-tbl]").forEach((el) =>
      el.addEventListener("click", () => browseTable(el.getAttribute("data-tbl")))
    );
    box.querySelectorAll("[data-col]").forEach((el) =>
      el.addEventListener("click", (ev) => { ev.stopPropagation(); insertAtCursor(el.getAttribute("data-col")); })
    );
  }

  async function execute() {
    const ta = document.getElementById("pgSql");
    const out = document.getElementById("pgResult");
    const sql = ta.value.trim();
    if (!sql) return;

    // Nhiều câu? chỉ cần lệnh đầu là write thì coi là chế độ ghi
    if (WRITE_RE.test(sql)) {
      out.innerHTML = '<div class="pg-msg">Đang tính dự kiến ảnh hưởng…</div>';
      try {
        const n = await previewWrite(sql);
        const verb = (sql.match(WRITE_RE)[1] || "").toUpperCase();
        out.innerHTML =
          `<div class="pg-warn">⚠️ Lệnh <b>${verb}</b> bị chặn ở chế độ học — <b>không thực thi</b>.` +
          `<br>Dự kiến ảnh hưởng: <b>${n} dòng</b>. Dữ liệu demo giữ nguyên để bạn tiếp tục thử.</div>`;
      } catch (e) {
        out.innerHTML = `<div class="pg-err">Lỗi SQL: ${esc(e.message)}</div>`;
      }
      return;
    }

    out.innerHTML = '<div class="pg-msg">Đang chạy…</div>';
    browse = null; // query tự do → thoát chế độ duyệt bảng (header không sort/filter)
    try {
      const res = await runReadOnly(sql);
      renderResult(res, false);
    } catch (e) {
      out.innerHTML = `<div class="pg-err">Lỗi SQL: ${esc(e.message)}</div>`;
    }
  }

  // ---- Sơ đồ ERD (SVG) hiện khi mới mở playground ----
  // Vị trí các bảng trên canvas 720x460 (toạ độ góc trên-trái mỗi hộp)
  const ERD_POS = {
    customer_profiles: { x: 30,  y: 20 },
    customers:         { x: 30,  y: 200 },
    orders:            { x: 300, y: 110 },
    order_items:       { x: 300, y: 300 },
    products:          { x: 560, y: 300 },
  };
  const BOX_W = 150, ROW_H = 20, HEAD_H = 26;

  function boxHeight(t) { return HEAD_H + t.columns.length * ROW_H + 6; }

  // Điểm neo ở cạnh hộp để nối đường
  function anchor(name, side) {
    const t = window.SQL_DEMO.tables.find((x) => x.name === name);
    const p = ERD_POS[name];
    const h = boxHeight(t);
    if (side === "left") return { x: p.x, y: p.y + h / 2 };
    if (side === "right") return { x: p.x + BOX_W, y: p.y + h / 2 };
    if (side === "top") return { x: p.x + BOX_W / 2, y: p.y };
    return { x: p.x + BOX_W / 2, y: p.y + h }; // bottom
  }

  function renderErd() {
    const tables = window.SQL_DEMO.tables;
    const W = 730, H = 470;
    let svg = `<svg class="pg-erd" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;

    // Định nghĩa các đường nối: {a, aSide, b, bSide, kind, label}
    const links = [
      { a: "customer_profiles", aSide: "bottom", b: "customers", bSide: "top", kind: "1:1", label: "hồ sơ" },
      { a: "customers", aSide: "right", b: "orders", bSide: "left", kind: "1:n", label: "đặt" },
      { a: "orders", aSide: "bottom", b: "order_items", bSide: "top", kind: "1:n", label: "gồm dòng" },
      { a: "products", aSide: "left", b: "order_items", bSide: "right", kind: "1:n", label: "trong đơn" },
    ];

    // Vẽ đường trước (nằm dưới hộp)
    links.forEach((lk) => {
      const p1 = anchor(lk.a, lk.aSide), p2 = anchor(lk.b, lk.bSide);
      const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
      svg += `<path d="M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}" class="pg-erd-line" />`;
      // ký hiệu đầu "một" (vạch) ở phía a, "nhiều" (chân quạ) ở phía b nếu 1:n
      svg += crow(p1, p2, "one");
      svg += crow(p2, p1, lk.kind === "1:1" ? "one" : "many");
      svg += `<rect x="${mx - 26}" y="${my - 10}" width="52" height="18" rx="9" class="pg-erd-badge-bg"/>` +
             `<text x="${mx}" y="${my + 3}" class="pg-erd-badge">${lk.kind}</text>`;
    });

    // Vẽ hộp bảng
    tables.forEach((t) => {
      const p = ERD_POS[t.name];
      const h = boxHeight(t);
      svg += `<g class="pg-erd-box" data-erd-tbl="${t.name}">`;
      svg += `<rect x="${p.x}" y="${p.y}" width="${BOX_W}" height="${h}" rx="8" class="pg-erd-rect"/>`;
      svg += `<rect x="${p.x}" y="${p.y}" width="${BOX_W}" height="${HEAD_H}" rx="8" class="pg-erd-head"/>`;
      svg += `<rect x="${p.x}" y="${p.y + HEAD_H - 8}" width="${BOX_W}" height="8" class="pg-erd-head"/>`;
      svg += `<text x="${p.x + 10}" y="${p.y + 17}" class="pg-erd-title">${t.name}</text>`;
      t.columns.forEach((c, i) => {
        const cy = p.y + HEAD_H + i * ROW_H + 14;
        const key = c.key ? " 🔑" : "";
        svg += `<text x="${p.x + 10}" y="${cy}" class="pg-erd-col">${c.name}${key}</text>`;
        svg += `<text x="${p.x + BOX_W - 8}" y="${cy}" class="pg-erd-type" text-anchor="end">${c.type.slice(0, 3)}</text>`;
      });
      svg += `</g>`;
    });
    svg += `</svg>`;

    const out = document.getElementById("pgResult");
    browse = null;
    out.innerHTML =
      `<div class="pg-erd-wrap"><div class="pg-erd-hd">Sơ đồ quan hệ 5 bảng — bấm một bảng để xem dữ liệu</div>${svg}</div>`;
    out.querySelectorAll("[data-erd-tbl]").forEach((el) =>
      el.addEventListener("click", () => browseTable(el.getAttribute("data-erd-tbl")))
    );
  }

  // Vẽ ký hiệu quan hệ ở đầu đường (from p → hướng q). type: "one" (vạch) | "many" (chân quạ)
  function crow(p, q, type) {
    const dx = q.x - p.x, dy = q.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;       // vector đơn vị hướng vào tâm kia
    const px = -uy, py = ux;                    // vector vuông góc
    const off = 16;                             // khoảng cách từ mép hộp
    const cx = p.x + ux * off, cy = p.y + uy * off;
    if (type === "one") {
      // một vạch ngang vuông góc
      return `<line x1="${cx + px * 7}" y1="${cy + py * 7}" x2="${cx - px * 7}" y2="${cy - py * 7}" class="pg-erd-mark"/>`;
    }
    // chân quạ (nhiều): 3 nét toả từ mép hộp
    const tipX = p.x + ux * 2, tipY = p.y + uy * 2;
    return `<line x1="${tipX}" y1="${tipY}" x2="${cx + px * 8}" y2="${cy + py * 8}" class="pg-erd-mark"/>` +
           `<line x1="${tipX}" y1="${tipY}" x2="${cx}" y2="${cy}" class="pg-erd-mark"/>` +
           `<line x1="${tipX}" y1="${tipY}" x2="${cx - px * 8}" y2="${cy - py * 8}" class="pg-erd-mark"/>`;
  }

  function renderSamples() {
    const sel = document.getElementById("pgSamples");
    sel.innerHTML = '<option value="">— Chọn query mẫu —</option>';
    window.SQL_DEMO.samples.forEach((s, i) => {
      sel.innerHTML += `<option value="${i}">${s.label}</option>`;
    });
    sel.onchange = () => {
      const i = sel.value;
      if (i === "") return;
      document.getElementById("pgSql").value = window.SQL_DEMO.samples[i].sql;
      document.getElementById("pgResult").innerHTML =
        '<div class="pg-msg">Đã nạp query mẫu — bấm ▶ Chạy để xem kết quả.</div>';
    };
  }

  function insertAtCursor(text) {
    const ta = document.getElementById("pgSql");
    const s = ta.selectionStart, e = ta.selectionEnd;
    ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
    ta.selectionStart = ta.selectionEnd = s + text.length;
    ta.focus();
  }

  let built = false;
  function buildOnce() {
    if (built) return;
    built = true;
    renderSchema();
    renderSamples();
    document.getElementById("pgRun").onclick = execute;
    document.getElementById("pgSql").addEventListener("keydown", (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") { ev.preventDefault(); execute(); }
    });
    document.getElementById("pgClear").onclick = () => {
      document.getElementById("pgSql").value = "";
      document.getElementById("pgResult").innerHTML = "";
    };
    const erdBtn = document.getElementById("pgErd");
    if (erdBtn) erdBtn.onclick = () => renderErd();
  }

  window.SQLPlayground = {
    open() {
      buildOnce();
      document.getElementById("pgOverlay").classList.add("show");
      document.getElementById("pgPanel").classList.add("show");
      // khởi tạo DB ngầm để lần chạy đầu nhanh
      initDb().catch(() => {});
      // hiện sơ đồ ERD nếu chưa có kết quả nào
      const out = document.getElementById("pgResult");
      if (!out.innerHTML.trim()) renderErd();
      document.getElementById("pgSql").focus();
    },
    showErd() { renderErd(); },
    close() {
      document.getElementById("pgOverlay").classList.remove("show");
      document.getElementById("pgPanel").classList.remove("show");
    },
  };
})();
