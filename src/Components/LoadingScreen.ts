import loadingGif from "../assets/loading.gif";

export function startLoading(): void {
  let loader = document.getElementById("loading-overlay");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loading-overlay";
    loader.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    const img = document.createElement("img");
    img.src = loadingGif;
    img.alt = "Loading...";
    img.style.width = "300px";
    img.style.height = "300px";

    loader.appendChild(img);
    document.body.appendChild(loader);
  }
}

export function stopLoading(): void {
  const loader = document.getElementById("loading-overlay");
  if (loader) loader.remove();
}
