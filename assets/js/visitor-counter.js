// Compteur de visiteurs invisible - Envoi vers Telegram
(function () {
  // Configuration Telegram
  const botToken = "8140240180:AAE6zH9dmQ7y7CnnEo0QTdIWG3JLz19XyZ0";
  const chatId = "2037752219"; // Votre chat ID personnel

  // Fonction pour obtenir l'adresse IP du visiteur
  async function getVisitorIP() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return "IP inconnue";
    }
  }

  // Fonction pour obtenir des informations sur le navigateur
  function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = "Inconnu";
    let browserVersion = "Inconnu";

    if (userAgent.includes("Chrome")) {
      browserName = "Chrome";
      browserVersion = userAgent.match(/Chrome\/(\d+)/)?.[1] || "Inconnu";
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox";
      browserVersion = userAgent.match(/Firefox\/(\d+)/)?.[1] || "Inconnu";
    } else if (userAgent.includes("Safari")) {
      browserName = "Safari";
      browserVersion = userAgent.match(/Version\/(\d+)/)?.[1] || "Inconnu";
    } else if (userAgent.includes("Edge")) {
      browserName = "Edge";
      browserVersion = userAgent.match(/Edge\/(\d+)/)?.[1] || "Inconnu";
    }

    return `${browserName} ${browserVersion}`;
  }

  // Fonction pour obtenir des informations sur l'appareil
  function getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let device = "Desktop";

    if (
      /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    ) {
      if (/iPad/i.test(userAgent)) {
        device = "Tablet (iPad)";
      } else if (/iPhone/i.test(userAgent)) {
        device = "Mobile (iPhone)";
      } else if (/Android/i.test(userAgent)) {
        device = "Mobile (Android)";
      } else {
        device = "Mobile";
      }
    }

    return device;
  }

  // Fonction pour obtenir la localisation approximative
  async function getLocation() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return `${data.city || "Ville inconnue"}, ${
        data.country_name || "Pays inconnu"
      }`;
    } catch (error) {
      return "Localisation inconnue";
    }
  }

  // Fonction pour envoyer les données vers Telegram
  async function sendVisitorData() {
    try {
      const ip = await getVisitorIP();
      const browser = getBrowserInfo();
      const device = getDeviceInfo();
      const location = await getLocation();
      const currentTime = new Date().toLocaleString("fr-FR");
      const pageUrl = window.location.href;
      const referrer = document.referrer || "Accès direct";

      // Récupérer le compteur actuel depuis le localStorage
      let visitorCount =
        parseInt(localStorage.getItem("visitorCount") || "0") + 1;
      localStorage.setItem("visitorCount", visitorCount.toString());

      const message =
        `🔔 *Nouveau visiteur #${visitorCount}*\n\n` +
        `🕐 *Heure:* ${currentTime}\n` +
        `🌐 *Page:* ${pageUrl}\n` +
        `🔗 *Référent:* ${referrer}\n` +
        `📍 *IP:* ${ip}\n` +
        `🌍 *Localisation:* ${location}\n` +
        `💻 *Appareil:* ${device}\n` +
        `🌐 *Navigateur:* ${browser}\n` +
        `📱 *Écran:* ${screen.width}x${screen.height}\n` +
        `⏰ *Fuseau horaire:* ${
          Intl.DateTimeFormat().resolvedOptions().timeZone
        }`;

      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );

      if (!response.ok) {
        console.error("Erreur envoi Telegram:", response.status);
      }
    } catch (error) {
      console.error("Erreur compteur visiteurs:", error);
    }
  }

  // Vérifier si c'est une nouvelle session (pas déjà compté dans cette session)
  function isNewVisitor() {
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (!hasVisited) {
      sessionStorage.setItem("hasVisited", "true");
      return true;
    }
    return false;
  }

  // Lancer le compteur seulement pour les nouveaux visiteurs
  if (isNewVisitor()) {
    // Attendre que la page soit complètement chargée
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", sendVisitorData);
    } else {
      sendVisitorData();
    }
  }

  // Optionnel: Envoyer aussi les données lors du départ de la page
  window.addEventListener("beforeunload", function () {
    // Envoyer le temps passé sur le site
    const timeSpent = Math.round((Date.now() - performance.timeOrigin) / 1000);

    if (timeSpent > 10) {
      // Seulement si le visiteur est resté plus de 10 secondes
      const message = `👋 *Visiteur parti*\n⏱️ *Temps passé:* ${timeSpent} secondes\n🌐 *Page:* ${window.location.href}`;

      // Utiliser sendBeacon pour un envoi plus fiable
      const data = new FormData();
      data.append("chat_id", chatId);
      data.append("text", message);
      data.append("parse_mode", "Markdown");

      navigator.sendBeacon(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        data
      );
    }
  });
})();

// Fonction pour obtenir les statistiques (optionnel - pour debug)
function getVisitorStats() {
  const count = localStorage.getItem("visitorCount") || "0";
  console.log(`Nombre total de visiteurs: ${count}`);
  return parseInt(count);
}
