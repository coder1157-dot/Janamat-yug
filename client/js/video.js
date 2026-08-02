import { getNewsBySlug } from "./newsApi.js";

const slug = new URLSearchParams(location.search).get("slug");

async function loadVideo() {

    try {

        const res = await getNewsBySlug(slug);

        const news = res.news || res.data || res;

        document.getElementById("videoTitle").textContent = news.title;

        document.getElementById("videoDescription").innerHTML = news.content;

         let video = news.video || "";

if (!video) {
    return;
}

if (video.includes("watch?v=")) {
    video = video.replace("watch?v=", "embed/");
}

if (video.includes("youtu.be/")) {
    const id = video.split("youtu.be/")[1].split("?")[0];
    video = "https://www.youtube.com/embed/" + id;
}

if (video.includes("/shorts/")) {
    const id = video.split("/shorts/")[1].split("?")[0];
    video = "https://www.youtube.com/embed/" + id;
}

document.getElementById("videoPlayer").src = video;
    }
    catch (err) {

        console.log(err);

    }

}

loadVideo();