 import { getNewsBySlug, SERVER_BASE_URL } from "./newsApi.js";

const slug = new URLSearchParams(location.search).get("slug");

function getGalleryImageUrl(img) {
    if (!img) return "";

    // Agar already complete URL hai
    if (img.startsWith("http://") || img.startsWith("https://")) {
        return img;
    }

    // /uploads/... ko backend se load karo
    if (img.startsWith("/")) {
        return `${SERVER_BASE_URL}${img}`;
    }

    return `${SERVER_BASE_URL}/${img}`;
}

async function loadGallery() {
    try {
        const res = await getNewsBySlug(slug);

        const news = res.news || res.data || res;

        const images = news.gallery || [];

        const container = document.getElementById("galleryImages");

        if (!container) return;

        if (!images.length) {
            container.innerHTML = `
                <div class="col-12">
                    <p class="text-muted">इस समाचार के लिए कोई गैलरी फोटो उपलब्ध नहीं है।</p>
                </div>
            `;
            return;
        }

        container.innerHTML = images.map(img => `
            <div class="col-md-4 mb-4">
                <img
                    src="${getGalleryImageUrl(img)}"
                    class="img-fluid rounded shadow"
                    alt="${news.title || 'Gallery Image'}"
                    loading="lazy"
                    onerror="this.style.display='none'"
                >
            </div>
        `).join("");

    } catch (error) {
        console.error("Gallery loading error:", error);

        const container = document.getElementById("galleryImages");

        if (container) {
            container.innerHTML = `
                <div class="col-12">
                    <p class="text-danger">
                        गैलरी लोड नहीं हो सकी।
                    </p>
                </div>
            `;
        }
    }
}

loadGallery();