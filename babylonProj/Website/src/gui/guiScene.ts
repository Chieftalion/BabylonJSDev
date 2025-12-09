import { Engine, Scene, ArcRotateCamera, Vector3, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";

const parseMarkdown = (md: string) => {
  let html = "";
  const lines = md.split("\n");
  let inTable = false;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmedLine = line.trim();

    if (trimmedLine.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        html += "<pre><code>";
      } else {
        html += "</code></pre>";
      }
      continue;
    }

    if (inCodeBlock) {
      html += line + "\n";
      continue;
    }

    if (trimmedLine.startsWith("|")) {
      if (!inTable) {
        html += "<table>";
        inTable = true;
      }
      if (trimmedLine.includes("---")) {
        continue;
      }
      const cells = trimmedLine.split("|").filter(c => c.trim() !== "");
      html += "<tr>";
      cells.forEach(cell => {
        if (html.includes("<th>")) {
          html += `<td>${cell.trim()}</td>`;
        } else {
          html += `<th>${cell.trim()}</th>`;
        }
      });
      html += "</tr>";
    } else {
      if (inTable) {
        html += "</table>";
        inTable = false;
      }
      if (trimmedLine.startsWith("# ")) {
        html += `<h1>${trimmedLine.substring(2)}</h1>`;
      } else if (trimmedLine.startsWith("## ")) {
        html += `<h2>${trimmedLine.substring(3)}</h2>`;
      } else if (trimmedLine.startsWith("### ")) {
        html += `<h3>${trimmedLine.substring(4)}</h3>`;
      } else if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
        html += `<li>${trimmedLine.substring(2)}</li>`;
      } else if (trimmedLine.startsWith("> ")) {
        html += `<blockquote>${trimmedLine.substring(2)}</blockquote>`;
      } else if (trimmedLine.length > 0) {
        html += `<p>${trimmedLine}</p>`;
      }
    }
  }
  if (inTable) html += "</table>";
  if (inCodeBlock) html += "</code></pre>";

  return `<div class="markdown-body">${html}</div>`;
};

export default function menuScene(engine: Engine, setSceneCallback: (i: number) => void) {
  let scene = new Scene(engine);
  scene.autoClear = false;
  let camera = new ArcRotateCamera("menuCam", 0, Math.PI / 2, 10, Vector3.Zero(), scene);
  let sphere = MeshBuilder.CreateSphere("menuSphere", { diameter: 5 }, scene);
  let mat = new StandardMaterial("mat", scene);
  mat.wireframe = true;
  mat.emissiveColor = new Color3(0, 1, 0);
  sphere.material = mat;

  scene.onBeforeRenderObservable.add(() => {
    sphere.rotation.y += 0.01;
    sphere.rotation.x += 0.01;
  });

  const uiLayer = document.getElementById("ui-layer");
  if (uiLayer) {
    uiLayer.innerHTML = "";

    const navBar = document.createElement("div");
    navBar.className = "nav-bar";

    const title = document.createElement("div");
    title.className = "nav-title";
    title.innerText = "MY PORTFOLIO";
    navBar.appendChild(title);

    const navLinks = document.createElement("div");
    navLinks.className = "nav-links";

    const btnHome = document.createElement("button");
    btnHome.className = "nav-btn";
    btnHome.innerText = "HOME";
    btnHome.onclick = () => handleNavClick(-1);
    navLinks.appendChild(btnHome);

    const dropdown = document.createElement("div");
    dropdown.className = "dropdown";

    const btnDrop = document.createElement("button");
    btnDrop.className = "nav-btn";
    btnDrop.innerText = "ELEMENTS ▼";
    dropdown.appendChild(btnDrop);

    const dropContent = document.createElement("div");
    dropContent.className = "dropdown-content";

    const createDropItem = (text: string, idx: number) => {
      const b = document.createElement("button");
      b.innerText = text;
      b.onclick = () => handleNavClick(idx);
      dropContent.appendChild(b);
    };

    createDropItem("1. Meshes", 0);
    createDropItem("2. Village", 1);
    createDropItem("3. Physics", 2);
    createDropItem("4. Models", 3);
    createDropItem("5. Space", 4);

    dropdown.appendChild(dropContent);
    navLinks.appendChild(dropdown);

    const btnDocs = document.createElement("button");
    btnDocs.className = "nav-btn";
    btnDocs.innerText = "DOCS";
    btnDocs.onclick = () => handleNavClick(-2);
    navLinks.appendChild(btnDocs);

    navBar.appendChild(navLinks);
    uiLayer.appendChild(navBar);

    const subMenu = document.createElement("div");
    subMenu.className = "sub-menu";

    const btnAlpha = document.createElement("button");
    btnAlpha.className = "sub-btn";
    btnAlpha.innerText = "ALPHA SYSTEM";
    btnAlpha.onclick = () => setSceneCallback(4);
    subMenu.appendChild(btnAlpha);

    const btnSolar = document.createElement("button");
    btnSolar.className = "sub-btn";
    btnSolar.innerText = "SOLAR SYSTEM";
    btnSolar.onclick = () => setSceneCallback(5);
    subMenu.appendChild(btnSolar);

    uiLayer.appendChild(subMenu);

    const pageContainer = document.createElement("div");
    pageContainer.className = "page-container";
    uiLayer.appendChild(pageContainer);

    const handleNavClick = async (index: number) => {
      pageContainer.innerHTML = "";
      pageContainer.classList.remove("active");
      subMenu.style.display = "none";

      if (index === -1) {
        pageContainer.classList.add("active");
        pageContainer.innerHTML = `
                    <div class="home-wrapper">
                        <div class="home-title">Illia Temnokhod</div>
                        <div class="home-subtitle">JavaScript Games: Programming Fundamentals</div>
                        <div class="home-text">
                            Welcome to my 3D Portfolio. This project showcases the capabilities of Babylon.js
                            through 5 interactive elements, including physics simulations, procedural generation,
                            and complex scene management.
                        </div>
                        <a href="https://theilliatemnokhod.com" target="_blank" class="home-cta">Visit My Site</a>
                    </div>
                `;
        setSceneCallback(-1);
      }
      else if (index === -2) {
        pageContainer.classList.add("active");
        pageContainer.innerHTML = "<h1 style='color:white'>Loading Documentation...</h1>";
        try {
          const res = await fetch("/documentation.md");
          if (!res.ok) throw new Error("Doc not found");
          const text = await res.text();
          pageContainer.innerHTML = parseMarkdown(text);
        } catch (e) {
          pageContainer.innerHTML = "<h1>Error</h1><p>Ensure documentation.md is in public folder.</p>";
        }
        setSceneCallback(-1);
      }
      else if (index === 4 || index === 5) {
        subMenu.style.display = "flex";
        setSceneCallback(index);
      }
      else {
        setSceneCallback(index);
      }
    };

    handleNavClick(-1);
  }

  return { scene, sphere };
}