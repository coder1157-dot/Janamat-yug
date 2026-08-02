/* ==========================================================================
   upload.js — reusable single-file preview (image/video) and multi-file
   gallery uploader. Produces File objects; the calling module appends them
   to a FormData and posts via Api (Multer handles storage server-side).
   ========================================================================== */

const Upload = (() => {
  /**
   * Wires a drop-zone + hidden <input type="file"> pair for a single
   * image or video, with live preview.
   *
   * @param {object} opts
   *  dropzoneId, inputId, frameId, previewSelector (img/video tag inside frame),
   *  accept ('image' | 'video' | 'image,video'), onChange(file)
   */
  function initSingle({ dropzoneId, inputId, frameId, accept = 'image', onChange }) {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const frame = document.getElementById(frameId);
    if (!dropzone || !input || !frame) return { setExisting: () => {}, getFile: () => null, clear: () => {} };

    let currentFile = null;

    const mediaTag = () => frame.querySelector('img, video');

    function renderPreview(url, isVideo) {
      frame.style.display = 'block';
      dropzone.style.display = 'none';
      frame.innerHTML = `
        ${isVideo
          ? `<video src="${url}" controls></video>`
          : `<img src="${url}" alt="Preview">`}
        <button type="button" class="remove-media" aria-label="Remove media"><i class="bi bi-x-lg"></i></button>
      `;
      frame.querySelector('.remove-media').addEventListener('click', clear);
    }

    function clear() {
      currentFile = null;
      input.value = '';
      frame.style.display = 'none';
      frame.innerHTML = '';
      dropzone.style.display = '';
      onChange?.(null);
    }

    function handleFiles(fileList) {
      const file = fileList?.[0];
      if (!file) return;
      const isVideo = file.type.startsWith('video/');
      if (accept === 'image' && !file.type.startsWith('image/')) {
        Common.toast('Please choose an image file.', 'error');
        return;
      }
      if (accept === 'video' && !isVideo) {
        Common.toast('Please choose a video file.', 'error');
        return;
      }
      currentFile = file;
      const url = URL.createObjectURL(file);
      renderPreview(url, isVideo);
      onChange?.(file);
    }

    dropzone.addEventListener('click', () => input.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
      handleFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', (e) => handleFiles(e.target.files));

    return {
      getFile: () => currentFile,
      clear,
      setExisting: (url, isVideo = false) => { if (url) renderPreview(url, isVideo); },
    };
  }

  /**
   * Wires a gallery grid: click "add" tile to pick multiple images,
   * shows thumbnails with remove buttons. Keeps an internal list of
   * File objects (new uploads) plus any pre-existing URLs (edit mode).
   */
  function initGallery({ gridId, inputId, max = 12 }) {
    const grid = document.getElementById(gridId);
    const input = document.getElementById(inputId);
    if (!grid || !input) return { getFiles: () => [], getRemainingExisting: () => [], clear: () => {} };

    let files = [];
    let existing = []; // { url, id } pre-existing gallery images (edit mode)

    function render() {
      const existingTiles = existing.map((item) => `
        <div class="gallery-thumb" data-existing="${item.id}">
          <img src="${item.url}" alt="">
          <button type="button" class="remove-media" data-remove-existing="${item.id}"><i class="bi bi-x"></i></button>
        </div>`).join('');

      const newTiles = files.map((file, idx) => `
        <div class="gallery-thumb" data-new="${idx}">
          <img src="${URL.createObjectURL(file)}" alt="">
          <button type="button" class="remove-media" data-remove-new="${idx}"><i class="bi bi-x"></i></button>
        </div>`).join('');

      const addTile = (existing.length + files.length) < max
        ? `<div class="gallery-thumb-add" id="${gridId}AddTile"><i class="bi bi-plus-lg fs-4"></i></div>`
        : '';

      grid.innerHTML = existingTiles + newTiles + addTile;

      grid.querySelector(`#${gridId}AddTile`)?.addEventListener('click', () => input.click());
      grid.querySelectorAll('[data-remove-existing]').forEach((btn) => {
        btn.addEventListener('click', () => {
          existing = existing.filter((it) => String(it.id) !== btn.dataset.removeExisting);
          render();
        });
      });
      grid.querySelectorAll('[data-remove-new]').forEach((btn) => {
        btn.addEventListener('click', () => {
          files.splice(Number(btn.dataset.removeNew), 1);
          render();
        });
      });
    }

    input.addEventListener('change', (e) => {
      const room = max - (existing.length + files.length);
      const picked = Array.from(e.target.files).slice(0, Math.max(room, 0));
      files = files.concat(picked);
      input.value = '';
      render();
    });

    render();

    return {
      getFiles: () => files,
      getRemainingExisting: () => existing,
      setExisting: (list) => { existing = (list || []).map((url, i) => ({ url, id: i })); render(); },
      clear: () => { files = []; existing = []; render(); },
    };
  }

  return { initSingle, initGallery };
})();