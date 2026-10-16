(function () {
    "use strict";

    var GA_ID = "G-E6CDS03XD2";
    var ADS_ID = "AW-1069157336";
    var PRIVACY_URL = "/personvern.html";
    var COOKIE = "cookie_notice_accepted";

    var ids = [GA_ID, ADS_ID].filter(Boolean);
    var local = /\.example$/.test(location.hostname);
    var loaded = false;
    var leadSent = false;

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag("consent", "default", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied"
    });

    function getCookie(name) {
        var m = document.cookie.match("(?:^|; )" + name + "=([^;]*)");
        return m ? decodeURIComponent(m[1]) : null;
    }

    function setCookie(name, value, days) {
        var d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + value + "; expires=" + d.toUTCString() + "; path=/; SameSite=Lax" + (location.protocol === "https:" ? "; Secure" : "");
    }

    function deleteGoogleCookies() {
        var host = location.hostname.split(".").slice(-2).join(".");
        document.cookie.split("; ").forEach(function (c) {
            var n = c.split("=")[0];
            if (/^(_ga|_gid|_gat|_gcl_)/.test(n)) {
                document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=." + host;
                document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            }
        });
    }

    function loadGoogle() {
        if (loaded || !ids.length) return;
        loaded = true;
        gtag("consent", "update", {
            ad_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
            analytics_storage: "granted"
        });
        var s = document.createElement("script");
        s.async = true;
        s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ids[0]);
        document.head.appendChild(s);
        gtag("js", new Date());
        ids.forEach(function (id) { gtag("config", id); });
    }

    function lead() {
        if (!loaded || leadSent) return;
        leadSent = true;
        var sel = document.querySelector("form select");
        gtag("event", "generate_lead", { tjeneste: sel ? sel.value : "" });
    }

    function trackEvents() {
        document.addEventListener("click", function (e) {
            if (!loaded) return;
            var a = e.target.closest ? e.target.closest("a[href]") : null;
            if (!a) return;
            var h = a.getAttribute("href") || "";
            if (h.indexOf("tel:") === 0) gtag("event", "click_to_call");
            else if (h.indexOf("mailto:") === 0) gtag("event", "email_click");
            else if (/pubhtml5|\.pdf(\?|$)/i.test(h)) gtag("event", "brosjyre_click", { link_url: h });
        });
        var st = document.getElementById("formStatus");
        if (st && window.MutationObserver) {
            new MutationObserver(function () {
                if (st.classList.contains("is-success")) lead(); else leadSent = false;
            }).observe(st, { attributes: true, attributeFilter: ["class"] });
        }
        if (/[?&]sendt=1/.test(location.search)) lead();
    }

    function buildBanner() {
        var b = document.createElement("div");
        b.className = "consent-banner";
        b.setAttribute("role", "region");
        b.setAttribute("aria-label", "Informasjonskapsler");
        b.hidden = true;
        b.innerHTML =
            '<div class="consent-banner-inner">' +
            '<p class="consent-banner-text">Vi bruker informasjonskapsler (cookies) til statistikk og til å måle annonser, med Google Analytics og Google Ads. Det skjer bare hvis du godtar. <a href="' + PRIVACY_URL + '">Les mer</a>.</p>' +
            '<span class="consent-banner-actions">' +
            '<button type="button" class="consent-btn consent-btn-refuse">Avslå</button>' +
            '<button type="button" class="consent-btn consent-btn-accept">Godta</button>' +
            '</span></div>';
        document.body.appendChild(b);
        return b;
    }

    function init() {
        if (!ids.length && !local) return;
        var banner = buildBanner();
        var state = getCookie(COOKIE);

        function decide(value) {
            var was = getCookie(COOKIE);
            setCookie(COOKIE, value, 365);
            banner.hidden = true;
            if (value === "true") loadGoogle();
            else if (was === "true" || loaded) {
                gtag("consent", "update", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
                deleteGoogleCookies();
                location.reload();
            }
        }

        banner.querySelector(".consent-btn-accept").addEventListener("click", function () { decide("true"); });
        banner.querySelector(".consent-btn-refuse").addEventListener("click", function () { decide("false"); });

        var host = document.querySelector(".copyright");
        if (host) {
            var sep = document.createTextNode(" · ");
            var re = document.createElement("button");
            re.type = "button";
            re.className = "copyright-link consent-reopen";
            re.textContent = "Cookie-innstillinger";
            re.addEventListener("click", function () { banner.hidden = false; banner.querySelector(".consent-btn-accept").focus(); });
            var last = host.querySelector("p, div") || host;
            last.appendChild(sep);
            last.appendChild(re);
        }

        if (state === "true") loadGoogle();
        else if (state === null) banner.hidden = false;
        trackEvents();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
