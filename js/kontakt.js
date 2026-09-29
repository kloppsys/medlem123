(function () {
    var form = document.getElementById("contactForm");
    var status = document.getElementById("formStatus");
    if (!status) return;

    var params = new URLSearchParams(window.location.search);

    function showStatus(kind, message) {
        status.textContent = message;
        status.className = "form-status is-" + kind;
        status.focus();
    }

    // No-JS fallback: Web3Forms redirects here with ?sendt=1 after a native form POST.
    if (params.get("sendt") === "1") {
        showStatus("success", "Takk! Henvendelsen er sendt til Medlem123. Vi svarer til e-postadressen du oppga, normalt innen én virkedag.");
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, "", window.location.pathname);
        }
    }

    if (!form) return;

    // Preselect "Gjelder" from a link like /kontakt.html?tjeneste=Regweb
    var topicSelect = document.getElementById("contact-topic");
    var preselect = params.get("tjeneste");
    if (topicSelect && preselect) {
        var matchingOption = Array.prototype.find.call(topicSelect.options, function (opt) {
            return opt.value.toLowerCase() === preselect.toLowerCase();
        });
        if (matchingOption) topicSelect.value = matchingOption.value;
    }

    var submitButton = document.getElementById("contactSubmit");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var formData = new FormData(form);
        if (formData.get("botcheck")) {
            return;
        }

        if (form.querySelector(".h-captcha") && !formData.get("h-captcha-response")) {
            showStatus("error", "Fullfør captcha-sjekken før du sender skjemaet.");
            return;
        }

        var tjeneste = formData.get("tjeneste");
        formData.set("subject", tjeneste && tjeneste !== "Generelt" ? "Ny henvendelse: " + tjeneste + " — medlem123.no" : "Ny henvendelse fra medlem123.no");

        var payload = Object.fromEntries(formData);
        submitButton.disabled = true;
        submitButton.textContent = "Sender ...";
        status.className = "form-status";
        status.textContent = "";

        fetch(form.action, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
        })
            .then(function (response) {
                return response.json().then(function (json) {
                    return { ok: response.ok, json: json };
                });
            })
            .then(function (result) {
                if (result.ok) {
                    form.reset();
                    showStatus("success", "Takk! Henvendelsen er sendt til Medlem123. Vi svarer til e-postadressen du oppga, normalt innen én virkedag.");
                } else {
                    showStatus("error", "Vi klarte ikke å sende henvendelsen akkurat nå. Prøv igjen, eller ring 33 31 28 00.");
                }
            })
            .catch(function () {
                showStatus("error", "Kunne ikke sende henvendelsen. Sjekk nettforbindelsen og prøv igjen, eller ring 33 31 28 00.");
            })
            .finally(function () {
                submitButton.disabled = false;
                submitButton.textContent = "Send henvendelse";
            });
    });
})();
