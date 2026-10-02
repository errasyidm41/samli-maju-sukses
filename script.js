/**
 * script.js
 * Satu-satunya tempat logika render. Semua teks/gambar/link diambil dari config.json.
 * HTML (index.html) hanya berisi skeleton kosong dengan id/data-attribute sebagai target.
 * Menambah/mengurangi item pada array di config.json (services, clients, whyUs, nav, dst)
 * akan otomatis tercermin di halaman tanpa mengubah HTML.
 */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * Ikon inline (SVG, stroke="currentColor") — dipetakan lewat id/judul
   * supaya non-developer tetap bisa mengganti TEKS di config.json tanpa
   * perlu menyentuh ikon. Item baru yang tidak dikenali akan memakai
   * ikon default (kotak) sehingga array tetap aman ditambah/kurangi.
   * ------------------------------------------------------------------- */
  const ICONS = {
    "cargo-thermoking": `<path d="M12 3v18M5 6l14 12M19 6L5 18" stroke-linecap="round"/><circle cx="12" cy="12" r="9"/>`,
    "jasa-ekspedisi": `<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7.5" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>`,
    "cold-storage": `<path d="M3 9.5 12 4l9 5.5V19a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>`,
    "default-service": `<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h16M9 4v16"/>`,
    "Integritas": `<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>`,
    "Tepat Waktu": `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2" stroke-linecap="round"/>`,
    "Memiliki Tim Profesional": `<circle cx="12" cy="8" r="3.2"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke-linecap="round"/>`,
    "Biaya Terjangkau": `<path d="M4 7h13a3 3 0 0 1 3 3v7H4z"/><circle cx="15" cy="13.5" r="2"/><path d="M4 7V5a1 1 0 0 1 1-1h9" stroke-linecap="round"/>`,
    "Berpengalaman": `<circle cx="6" cy="8" r="2.4"/><circle cx="18" cy="8" r="2.4"/><circle cx="12" cy="16" r="2.4"/><path d="M6 10.4V13M18 10.4V13M8 8h8M8.6 14.2 10.6 15.6M15.4 14.2 13.4 15.6" stroke-linecap="round"/>`,
    "Terpercaya": `<path d="M8 12.5 11 15.5 16 9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9"/>`
  };

  function iconSvg(key, size) {
    const s = size || 26;
    const body = ICONS[key] || ICONS["default-service"];
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
      body + "</svg>"
    );
  }

  const digitsOnly = (str) => (str || "").replace(/[^\d+]/g, "");

  function buildWaLink(whatsapp) {
    const msg = encodeURIComponent(whatsapp.defaultMessage || "");
    return "https://wa.me/" + whatsapp.number + (msg ? "?text=" + msg : "");
  }

  function setYear() {
    const yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /**
   * Menyiapkan fallback untuk <img>: kalau file gambar di path config.json
   * belum ada / gagal dimuat, elemen diganti dengan kotak bergaris putus-putus
   * berlabel "Foto tidak tersedia" — sehingga struktur layout tetap terjaga
   * sampai editor mengganti gambar aslinya.
   * variant "dark" dipakai di section berlatar navy, default untuk latar terang.
   */
  function attachImgFallback(imgEl, label, variant) {
    if (!imgEl) return;
    imgEl.addEventListener(
      "error",
      function onError() {
        imgEl.removeEventListener("error", onError);
        const ph = document.createElement("div");
        ph.className =
          (imgEl.getAttribute("class") || "") +
          " flex items-center justify-center text-center px-2 border-2 border-dashed " +
          (variant === "dark"
            ? "border-[#F5F5F0]/30 bg-white/[0.03] text-[#F5F5F0]/45"
            : "border-[#0B1F3A]/25 bg-[#0B1F3A]/[0.03] text-[#0B1F3A]/45") +
          " text-[11px] font-semibold leading-snug";
        ph.textContent = label || "Foto tidak tersedia";
        if (imgEl.parentNode) imgEl.parentNode.replaceChild(ph, imgEl);
      },
      { once: true }
    );
  }

  /* ------------------------------- NAVBAR ------------------------------ */
  function renderNavbar(config) {
    const logoIcon = document.getElementById("navbar-logo-icon");
    const logoText = document.getElementById("navbar-logo-text");
    if (logoIcon) {
      attachImgFallback(logoIcon, "Logo", "dark");
      logoIcon.src = config.company.logo.icon;
      logoIcon.alt = config.company.name + " logo";
    }
    if (logoText) {
      logoText.textContent = config.company.logo.text;
      logoText.classList.toggle("hidden", !config.company.logo.showText);
    }

    const navList = document.getElementById("navbar-menu");
    const navListMobile = document.getElementById("navbar-menu-mobile");
    [navList, navListMobile].forEach((list) => {
      if (!list) return;
      list.innerHTML = "";
      config.nav.forEach((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.label;
        a.className =
          list === navList
            ? "text-sm font-medium text-[#F5F5F0]/85 hover:text-[#D4A94A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A94A] rounded-sm"
            : "block py-3 text-base font-medium text-[#F5F5F0] border-b border-white/10 focus:outline-none focus:ring-2 focus:ring-[#D4A94A] rounded-sm";
        li.appendChild(a);
        list.appendChild(li);
      });
    });

    document.querySelectorAll("[data-navbar-whatsapp]").forEach((btn) => {
      btn.href = buildWaLink(config.contact.whatsapp);
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
    });

    const hamburger = document.getElementById("navbar-hamburger");
    const mobileMenu = document.getElementById("navbar-mobile-panel");
    if (hamburger && mobileMenu) {
      hamburger.addEventListener("click", () => {
        const isOpen = !mobileMenu.classList.contains("hidden");
        mobileMenu.classList.toggle("hidden", isOpen);
        hamburger.setAttribute("aria-expanded", String(!isOpen));
      });
      mobileMenu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => mobileMenu.classList.add("hidden"))
      );
    }
  }


  /* -------------------------------- HERO -------------------------------- */
function renderHero(config) {
  // Logika background image dihapus agar murni menggunakan warna background CSS (bg-navy)

  const headline = document.getElementById("hero-headline");
  const sub = document.getElementById("hero-subheadline");
  if (headline) headline.textContent = config.hero.headline;
  if (sub) sub.textContent = config.hero.subheadline;

  const ctaPrimary = document.getElementById("hero-cta-primary");
  if (ctaPrimary) {
    ctaPrimary.textContent = config.hero.ctaPrimary.label;
    ctaPrimary.href = buildWaLink(config.contact.whatsapp);
    ctaPrimary.target = "_blank";
    ctaPrimary.rel = "noopener noreferrer";
  }

  const ctaSecondary = document.getElementById("hero-cta-secondary");
  if (ctaSecondary) {
    ctaSecondary.textContent = config.hero.ctaSecondary.label;
    ctaSecondary.href = config.hero.ctaSecondary.href;
  }
}

  /* ------------------------------- PROFIL ------------------------------- */
  function renderProfile(config) {
    const p = config.profile;
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setText("profile-title", p.title);
    setText("profile-description", p.description);
    setText("profile-subdescription", p.subDescription);
    setText("profile-goal", p.goal);
    setText("profile-vision-text", p.vision);

    const img = document.getElementById("profile-image");
    if (img) {
      attachImgFallback(img, "Foto tidak tersedia", "light");
      img.src = p.image;
      img.alt = "Kantor " + config.company.name;
    }

    const missionList = document.getElementById("profile-mission-list");
    if (missionList) {
      missionList.innerHTML = "";
      p.mission.forEach((point) => {
        const li = document.createElement("li");
        li.className = "flex gap-3 text-[#0B1F3A]/85 leading-relaxed";
        li.innerHTML =
          '<span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4A94A]"></span><span>' +
          point + "</span>";
        missionList.appendChild(li);
      });
    }
  }

  /* ------------------------------ LAYANAN -------------------------------- */
  function renderServices(config) {
    const wrap = document.getElementById("services-grid");
    if (!wrap) return;
    wrap.innerHTML = "";
    config.services.forEach((svc) => {
      const card = document.createElement("article");
      card.className =
        "group border-l-4 border-[#D4A94A] bg-white/[0.04] pl-6 pr-5 py-7 flex flex-col gap-4";
      card.innerHTML =
        '<div class="h-11 w-11 flex items-center justify-center text-[#D4A94A]">' +
        iconSvg(svc.id, 30) +
        '</div>' +
        '<h3 class="text-xl font-bold text-[#F5F5F0]">' + svc.title + "</h3>" +
        '<p class="text-sm leading-relaxed text-[#F5F5F0]/70">' + svc.description + "</p>";

      const img = document.createElement("img");
      img.setAttribute("class", "mt-1 h-36 w-full object-cover");
      img.loading = "lazy";
      img.alt = "Ilustrasi layanan " + svc.title + " — " + config.company.name;
      attachImgFallback(img, "Foto tidak tersedia", "dark");
      img.src = svc.image;
      card.appendChild(img);

      wrap.appendChild(card);
    });
  }

  /* ------------------------------- CLIENT -------------------------------- */
  /* ------------------------------- CLIENT -------------------------------- */
  function renderClients(config) {
    const wrap = document.getElementById("clients-grid");
    if (!wrap) return;
    wrap.innerHTML = "";

    const showFallback = (cell, client) => {
      // Hilangkan border/bingkai, jadikan transparan bersih
      cell.className = "flex flex-col items-center justify-center p-3 text-center";
      cell.innerHTML =
        '<div class="flex flex-col items-center gap-1 px-1">' +
        '<span class="text-center text-xs font-semibold text-[#0B1F3A]/75 leading-tight">' +
        client.name + "</span>" +
        '<span class="text-[10px] text-[#0B1F3A]/40">Foto tidak tersedia</span>' +
        "</div>";
    };

    // Mengambil maksimal 17 data client saja
    const clientList = config.clients.slice(0, 17);

    clientList.forEach((client) => {
      const cell = document.createElement("div");
      // Hapus kelas 'border border-solid border-[#0B1F3A]/10 bg-white' agar bingkai putihnya hilang
      cell.className = "flex flex-col items-center justify-center p-3 text-center bg-transparent";

      if (!client.logo) {
        showFallback(cell, client);
      } else {
        const img = document.createElement("img");
        img.setAttribute("class", "max-h-12 max-w-full object-contain mb-2");
        img.loading = "lazy";
        img.alt = "Logo " + client.name;
        img.addEventListener("error", () => showFallback(cell, client), { once: true });
        img.src = client.logo;
        cell.appendChild(img);

        // Menampilkan nama perusahaan di bawah logo
        const nameEl = document.createElement("span");
        nameEl.className = "text-[11px] font-medium text-[#0B1F3A]/80 leading-tight";
        nameEl.textContent = client.name;
        cell.appendChild(nameEl);
      }
      wrap.appendChild(cell);
    });
  }

  /* --------------------------- KEUNGGULAN & LEGALITAS -------------------- */
  function renderWhyUs(config) {
    const wrap = document.getElementById("whyus-grid");
    if (!wrap) return;
    wrap.innerHTML = "";
    
    // Penjelasan singkat untuk setiap keunggulan PT. Samli Maju Sukses
    const descriptions = {
      "Integritas": "Menjunjung tinggi standar profesionalisme dan kejujuran dalam setiap layanan logistik.",
      "Tepat Waktu": "Komitmen penuh memastikan pengiriman barang sampai tujuan sesuai jadwal.",
      "Memiliki Tim Profesional": "Didukung oleh sumber daya manusia yang berpengalaman dan solid di bidangnya.",
      "Biaya Terjangkau": "Menyediakan solusi tarif yang kompetitif tanpa menurunkan kualitas pelayanan.",
      "Berpengalaman": "Berpengalaman melayani pendistribusian barang dari hulu ke hilir sejak 2019.",
      "Terpercaya": "Diandalkan oleh berbagai perusahaan ternama dari Sabang sampai Merauke."
    };

    config.whyUs.forEach((item) => {
      const cell = document.createElement("div");
      // Mengubah tata letak menjadi card/grid dengan penjelasan singkat
      cell.className = "flex flex-col items-center text-center p-6 bg-navy/5 border border-navy/10 rounded-sm shadow-sm hover:shadow-md transition-shadow";
      
      const desc = descriptions[item.title] || "Solusi logistik terpercaya untuk kebutuhan Anda.";

      cell.innerHTML =
        '<div class="h-14 w-14 flex items-center justify-center rounded-full bg-navy/10 text-navy mb-4">' +
        iconSvg(item.title, 28) +
        "</div>" +
        '<h3 class="text-base font-bold text-navy mb-2">' + item.title + "</h3>" +
        '<p class="text-xs text-navy/70 leading-relaxed">' + desc + "</p>";
      wrap.appendChild(cell);
    });
  }

  

  /* ------------------------------- KONTAK -------------------------------- */
  function renderContact(config) {
    const c = config.contact;
    const waBtn = document.getElementById("contact-whatsapp-btn");
    if (waBtn) {
      waBtn.href = buildWaLink(c.whatsapp);
      waBtn.target = "_blank";
      waBtn.rel = "noopener noreferrer";
    }

    const phoneWrap = document.getElementById("contact-phones");
    if (phoneWrap) {
      phoneWrap.innerHTML = "";
      c.phones.forEach((phone) => {
        const a = document.createElement("a");
        a.href = "tel:" + digitsOnly(phone);
        a.textContent = phone;
        a.className =
          "block text-[#F5F5F0]/90 hover:text-[#D4A94A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A94A] rounded-sm";
        phoneWrap.appendChild(a);
      });
    }

    const emailEl = document.getElementById("contact-email");
    if (emailEl) {
      emailEl.href = "mailto:" + c.email;
      emailEl.textContent = c.email;
    }

    const headOfficeWrap = document.getElementById("contact-head-office");
    if (headOfficeWrap) {
      headOfficeWrap.innerHTML =
        '<p class="text-sm font-semibold text-[#D4A94A] mb-1">' + c.headOffice.label + "</p>" +
        '<p class="text-sm text-[#F5F5F0]/75 leading-relaxed">' + c.headOffice.address + "</p>";
    }

    const branchWrap = document.getElementById("contact-branch-offices");
    if (branchWrap) {
      branchWrap.innerHTML = "";
      c.branchOffices.forEach((branch) => {
        const div = document.createElement("div");
        div.innerHTML =
          '<p class="text-sm font-semibold text-[#D4A94A] mb-1">' + branch.city + "</p>" +
          '<p class="text-sm text-[#F5F5F0]/75 leading-relaxed">' + branch.address + "</p>";
        branchWrap.appendChild(div);
      });
    }
  }

  /* -------------------------------- FOOTER -------------------------------- */
  /* -------------------------------- FOOTER -------------------------------- */
  function renderFooter(config) {
    const logoIcon = document.getElementById("footer-logo-icon");
    const logoText = document.getElementById("footer-logo-text");
    if (logoIcon) {
      attachImgFallback(logoIcon, "Logo", "dark");
      logoIcon.src = config.company.logo.icon;
      logoIcon.alt = config.company.name + " logo";
    }
    if (logoText) {
      logoText.textContent = config.company.logo.text;
      // Menambahkan pengaturan agar teks disembunyikan/ditampilkan sesuai config.json seperti di header
      logoText.classList.toggle("hidden", !config.company.logo.showText);
    }
    const tagline = document.getElementById("footer-tagline");
    if (tagline) tagline.textContent = config.company.tagline;
    
    const navWrap = document.getElementById("footer-nav");
    if (navWrap) {
      navWrap.innerHTML = "";
      config.nav.forEach((item) => {
        const a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.label;
        a.className =
          "text-sm text-[#F5F5F0]/70 hover:text-[#D4A94A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A94A] rounded-sm";
        navWrap.appendChild(a);
      });
    }
    
    const contactWrap = document.getElementById("footer-contact");
    if (contactWrap) {
      contactWrap.innerHTML =
        '<a href="mailto:' + config.contact.email + '" class="block text-sm text-[#F5F5F0]/70 hover:text-[#D4A94A]">' +
        config.contact.email + "</a>" +
        '<a href="tel:' + digitsOnly(config.contact.phones[0]) +
        '" class="block text-sm text-[#F5F5F0]/70 hover:text-[#D4A94A] mt-1">' +
        config.contact.phones[0] + "</a>";
    }
    
    const copyName = document.getElementById("footer-copy-name");
    if (copyName) copyName.textContent = config.company.name;
  }
  /* --------------------------------- INIT --------------------------------- */
  async function init() {
    try {
      const res = await fetch("config.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat config.json (" + res.status + ")");
      const config = await res.json();

      document.title = config.company.name + " — " + config.company.industry;

      renderNavbar(config);
      renderHero(config);
      renderProfile(config);
      renderServices(config);
      renderClients(config);
      renderWhyUs(config);
      
      renderContact(config);
      renderFooter(config);
      setYear();
    } catch (err) {
      console.error("[Samli Maju Sukses] Gagal memuat konten:", err);
      const hero = document.getElementById("hero");
      if (hero) {
        hero.innerHTML =
          '<p class="p-8 text-white bg-[#0B1F3A]">Konten belum bisa dimuat. Pastikan file config.json tersedia di folder yang sama dan halaman diakses lewat server (bukan dibuka langsung sebagai file://).</p>';
      }
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
