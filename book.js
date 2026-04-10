
    // ── DATA ──
    const TOTAL = 50;
    let books = JSON.parse(localStorage.getItem('buku-koleksi') || 'null') || Array.from({length: TOTAL}, () => ({
        title: '', author: '', status: '', rating: '', note: '', img: ''
    }));

    let currentSlot = null;
    let tempImg = '';

    // ── RENDER ──
    function render(filter = '') {
        const container = document.getElementById('bookGallery');
        container.innerHTML = '';
        const lc = filter.toLowerCase();

        books.forEach((b, i) => {
            const matchTitle  = b.title.toLowerCase().includes(lc);
            const matchAuthor = b.author.toLowerCase().includes(lc);
            if (filter && !matchTitle && !matchAuthor) return;

            const stars = b.rating ? '⭐'.repeat(Math.min(5, parseInt(b.rating))) : '';
            const card = document.createElement('div');
            card.className = 'book-card';
            card.style.animationDelay = (i % 20 * 0.04) + 's';
            card.onclick = () => openModal(i);

            card.innerHTML = `
                <div class="book-image">
                    <span class="slot-num">#${String(i+1).padStart(2,'0')}</span>
                    ${b.status ? `<span class="status-badge ${b.status}">${b.status === 'sudah-baca' ? '✓ Baca' : b.status === 'sedang-baca' ? '📖 Baca' : '○ Antri'}</span>` : ''}
                    ${b.img
                        ? `<img src="${b.img}" alt="${b.title}" class="loaded">`
                        : `<div class="placeholder-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <rect x="3" y="2" width="18" height="20" rx="2"/>
                                <path d="M7 6h10M7 10h10M7 14h6"/>
                            </svg>
                            <span>Slot ${i+1}</span>
                           </div>`
                    }
                </div>
                <div class="book-info">
                    <div class="book-title">${b.title || '<span style="color:var(--text-dim);font-style:italic;font-size:0.82rem">Kosong — klik untuk isi</span>'}</div>
                    ${b.author ? `<div class="book-author">${b.author}</div>` : ''}
                    ${stars ? `<div class="book-rating">${stars}</div>` : ''}
                </div>`;
            container.appendChild(card);
        });

        updateStats();
    }

    function updateStats() {
        const filled  = books.filter(b => b.title).length;
        const read    = books.filter(b => b.status === 'sudah-baca').length;
        const reading = books.filter(b => b.status === 'sedang-baca').length;
        document.getElementById('statFilled').innerHTML   = `Terisi <strong>${filled}</strong>`;
        document.getElementById('statRead').innerHTML     = `Sudah Baca <strong>${read}</strong>`;
        document.getElementById('statReading').innerHTML  = `Sedang Dibaca <strong>${reading}</strong>`;
    }

    // ── MODAL ──
    function openModal(i) {
        currentSlot = i;
        tempImg = books[i].img || '';
        const b = books[i];

        document.getElementById('modalTitle').textContent = `Slot #${String(i+1).padStart(2,'0')}`;
        document.getElementById('inputTitle').value  = b.title;
        document.getElementById('inputAuthor').value = b.author;
        document.getElementById('inputStatus').value = b.status;
        document.getElementById('inputRating').value = b.rating;
        document.getElementById('inputNote').value   = b.note;

        const prev = document.getElementById('imgPreview');
        prev.innerHTML = tempImg
            ? `<img src="${tempImg}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`
            : '<span>Klik untuk pilih foto sampul</span>';

        document.getElementById('modalOverlay').classList.add('open');
    }

    function closeModal() {
        document.getElementById('modalOverlay').classList.remove('open');
        currentSlot = null; tempImg = '';
    }

    function saveBook() {
        books[currentSlot] = {
            title:  document.getElementById('inputTitle').value.trim(),
            author: document.getElementById('inputAuthor').value.trim(),
            status: document.getElementById('inputStatus').value,
            rating: document.getElementById('inputRating').value,
            note:   document.getElementById('inputNote').value.trim(),
            img:    tempImg
        };
        localStorage.setItem('buku-koleksi', JSON.stringify(books));
        closeModal();
        render(document.getElementById('searchInput').value);
    }

    function clearBook() {
        books[currentSlot] = { title:'', author:'', status:'', rating:'', note:'', img:'' };
        localStorage.setItem('buku-koleksi', JSON.stringify(books));
        closeModal();
        render(document.getElementById('searchInput').value);
    }

    // ── IMAGE INPUT ──
    document.getElementById('imgInput').addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            tempImg = e.target.result;
            const prev = document.getElementById('imgPreview');
            prev.innerHTML = `<img src="${tempImg}" style="width:100%;height:100%;object-fit:cover;border-radius:8px">`;
        };
        reader.readAsDataURL(file);
    });

    // ── SEARCH ──
    document.getElementById('searchInput').addEventListener('input', function() {
        render(this.value);
    });

    // ── WALLPAPER ──
    const bgLayer = document.getElementById('bg-layer');

    function setPreset(btn, gradient) {
        document.querySelectorAll('.wp-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bgLayer.className = '';
        bgLayer.style.background = gradient;
        localStorage.setItem('wp-type', 'gradient');
        localStorage.setItem('wp-value', gradient);
    }

    document.getElementById('wp-upload').addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            bgLayer.className = '';
            bgLayer.style.background = `url('${e.target.result}') center/cover no-repeat`;
            bgLayer.style.backgroundSize = 'cover';
            document.querySelectorAll('.wp-btn').forEach(b => b.classList.remove('active'));
            localStorage.setItem('wp-type', 'image');
            localStorage.setItem('wp-value', e.target.result);
        };
        reader.readAsDataURL(file);
    });

    // ── RESTORE WALLPAPER ──
    const wpType = localStorage.getItem('wp-type');
    const wpVal  = localStorage.getItem('wp-value');
    if (wpType && wpVal) {
        if (wpType === 'gradient') {
            bgLayer.className = '';
            bgLayer.style.background = wpVal;
        } else {
            bgLayer.className = '';
            bgLayer.style.background = `url('${wpVal}') center/cover no-repeat`;
        }
    }

    // ── CLOSE MODAL ON OVERLAY CLICK ──
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    // ── INIT ──
    render();