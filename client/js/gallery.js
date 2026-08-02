import { getNewsBySlug } from "./newsApi.js";

const slug = new URLSearchParams(location.search).get("slug");

async function loadGallery(){

    const res = await getNewsBySlug(slug);

    const news = res.news || res.data || res;

    const images = news.gallery || [];

    const container=document.getElementById("galleryImages");

    container.innerHTML=images.map(img=>`

        <div class="col-md-4">

            <img
                src="${img}"
                class="img-fluid rounded shadow"

            >

        </div>

    `).join("");

}

loadGallery();