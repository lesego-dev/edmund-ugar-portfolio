/**
 * Renders content managed via Pages CMS (see /.pages.yml) into the static
 * HTML pages. Content lives in /content/*.json and is edited through
 * https://app.pagescms.org — this script just fetches and displays it.
 */

(function () {
  "use strict";

  function el(tag, opts) {
    var node = document.createElement(tag);
    if (opts && opts.className) node.className = opts.className;
    return node;
  }

  function label(text, value) {
    var p = el("p");
    var strong = el("strong");
    strong.textContent = text;
    p.appendChild(strong);
    p.appendChild(document.createElement("br"));
    p.appendChild(document.createTextNode(value));
    return p;
  }

  function eventCard(item) {
    var card = el("div", { className: "portfolio-item" });

    var h3 = el("h3");
    h3.textContent = item.title || "";
    card.appendChild(h3);

    if (item.role) card.appendChild(label("Role", item.role));
    if (item.date) card.appendChild(label("Date", item.date));
    if (item.location) card.appendChild(label("Location", item.location));

    if (item.theme) {
      var p = el("p");
      var strong = el("strong");
      strong.textContent = "Theme";
      var em = el("em");
      em.textContent = item.theme;
      p.appendChild(strong);
      p.appendChild(document.createElement("br"));
      p.appendChild(em);
      card.appendChild(p);
    }

    return card;
  }

  function mediaCard(item) {
    var card = el("div", { className: "portfolio-item" });

    var h3 = el("h3");
    h3.textContent = item.title || "";
    card.appendChild(h3);

    if (item.date) card.appendChild(label("Date", item.date));
    if (item.programme) card.appendChild(label("Programme", item.programme));
    if (item.topic) card.appendChild(label("Topic", item.topic));

    if (item.description) {
      var p = el("p");
      p.textContent = item.description;
      card.appendChild(p);
    }

    if (item.link) {
      var a = el("a", { className: "btn-small" });
      a.href = item.link;
      a.target = "_blank";
      a.textContent = item.linkText || "Read More";
      card.appendChild(a);
    }

    return card;
  }

  function publicationCard(item) {
    var card = el("div", { className: "publication" });

    var h4 = el("h4");
    h4.textContent = item.title || "";
    card.appendChild(h4);

    if (item.description) {
      var desc = el("p");
      desc.textContent = item.description;
      card.appendChild(desc);
    }

    if (item.sourceValue) {
      var p = el("p");
      var strong = el("strong");
      strong.textContent = (item.sourceLabel || "Source") + ":";
      var em = el("em");
      em.textContent = item.sourceValue;
      p.appendChild(strong);
      p.appendChild(document.createTextNode(" "));
      p.appendChild(em);
      card.appendChild(p);
    }

    if (item.link) {
      var a = el("a", { className: "btn-small" });
      a.href = item.link;
      a.target = "_blank";
      a.textContent = item.linkText || "Read Publication";
      card.appendChild(a);
    }

    return card;
  }

  function renderInto(containerId, items, cardFn, emptyMessage) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!items || items.length === 0) {
      var p = el("p");
      p.textContent = emptyMessage;
      container.appendChild(p);
      return;
    }

    items.forEach(function (item) {
      container.appendChild(cardFn(item));
    });
  }

  function loadEventsAndMedia() {
    var hasEventsContainers =
      document.getElementById("upcoming-events") ||
      document.getElementById("recent-events");
    var hasMediaContainer = document.getElementById("media-appearances");

    if (hasEventsContainers) {
      fetch("content/events.json")
        .then(function (res) { return res.json(); })
        .then(function (data) {
          var items = data.items || [];
          var upcoming = items.filter(function (i) { return i.status === "upcoming"; });
          var recent = items.filter(function (i) { return i.status !== "upcoming"; });
          renderInto("upcoming-events", upcoming, eventCard, "No upcoming events scheduled at the moment — check back soon.");
          renderInto("recent-events", recent, eventCard, "No recent events to show yet.");
        })
        .catch(function (err) { console.error("Could not load events:", err); });
    }

    if (hasMediaContainer) {
      fetch("content/media.json")
        .then(function (res) { return res.json(); })
        .then(function (data) {
          renderInto("media-appearances", data.items || [], mediaCard, "No media appearances to show yet.");
        })
        .catch(function (err) { console.error("Could not load media appearances:", err); });
    }
  }

  function loadPublications() {
    var container = document.getElementById("publications-list");
    if (!container) return;

    fetch("content/publications.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = data.items || [];
        container.innerHTML = "";

        if (items.length === 0) {
          var p = el("p");
          p.textContent = "No publications to show yet.";
          container.appendChild(p);
          return;
        }

        // Group by year, then sort years descending
        var byYear = {};
        items.forEach(function (item) {
          var year = item.year || "Undated";
          if (!byYear[year]) byYear[year] = [];
          byYear[year].push(item);
        });

        var years = Object.keys(byYear).sort(function (a, b) {
          return b.localeCompare(a, undefined, { numeric: true });
        });

        years.forEach(function (year) {
          var yearBlock = el("div", { className: "publication-year" });
          var h3 = el("h3");
          h3.textContent = year;
          yearBlock.appendChild(h3);

          byYear[year].forEach(function (item) {
            yearBlock.appendChild(publicationCard(item));
          });

          container.appendChild(yearBlock);
        });
      })
      .catch(function (err) { console.error("Could not load publications:", err); });
  }

  function updateCvLinks() {
    var links = document.querySelectorAll("a.cv-link");
    if (!links.length) return;

    fetch("content/site.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.cv_file) return;
        links.forEach(function (link) {
          link.href = data.cv_file;
        });
      })
      .catch(function (err) { console.error("Could not load CV link:", err); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadEventsAndMedia();
    loadPublications();
    updateCvLinks();
  });
})();
