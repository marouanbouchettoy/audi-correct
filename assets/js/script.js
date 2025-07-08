// Mobile menu toggle
const mobileMenu = document.getElementById("mobileMenu");
const navLinks = document.getElementById("navLinks");

if (mobileMenu && navLinks) {
  mobileMenu.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Close mobile menu if open
    if (navLinks) {
      navLinks.classList.remove("active");
    }
  });
});

// Enhanced contact form handling with Telegram integration
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const name = formData.get("name");
    const phone = formData.get("phone");
    const email = formData.get("email");
    const city = formData.get("city");
    const service = formData.get("service");
    const message = formData.get("message") || ""; // Message optionnel

    // Validation des champs obligatoires
    if (!name || !phone || !email || !city || !service) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Veuillez entrer une adresse email valide.");
      return;
    }

    // Validation du téléphone
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      alert("Veuillez entrer un numéro de téléphone valide.");
      return;
    }

    // Afficher un indicateur de chargement
    const submitBtn = this.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Envoi en cours...";
    submitBtn.disabled = true;

    // Configuration Telegram - VÉRIFIEZ VOS IDENTIFIANTS
    // ⚠️ IMPORTANT: Remplacez par vos vrais identifiants
    const botToken = "8140240180:AAE6zH9dmQ7y7CnnEo0QTdIWG3JLz19XyZ0"; // Votre token de bot
    // const chatId = "-4821779559"; // Remplacez par votre vrai chat ID
    const chatId = "-1002872572481"; // Remplacez par votre vrai chat ID

    // Alternative avec proxy CORS
    const useProxy = false; // Désactivé pour tester directement
    const baseUrl = useProxy
      ? `https://api.allorigins.win/raw?url=https://api.telegram.org/bot${botToken}/sendMessage`
      : `https://api.telegram.org/bot${botToken}/sendMessage`;

    // Format du message pour Telegram
    const telegramMessage =
      `🔔 *Nouvelle demande de service*\n\n` +
      `👤 *Nom:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      `📱 *Téléphone:* ${phone}\n` +
      `🏙️ *Ville:* ${city}\n` +
      `🛠️ *Service:* ${service}` +
      (message ? `\n\n💬 *Message:*\n${message}` : "");

    try {
      // Envoi vers Telegram avec timeout et retry
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: "Markdown",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Vérifier si la réponse est ok
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();

      if (data.ok) {
        alert(
          `Merci ${name} ! Votre demande pour ${service} à ${city} a été reçue. Nous vous recontacterons rapidement.`
        );
        this.reset();
      } else {
        alert("Erreur lors de l'envoi du message. Veuillez réessayer.");
      }
    } catch (error) {

      if (error.name === "AbortError") {
        alert("Timeout: La requête a pris trop de temps. Veuillez réessayer.");
      } else if (error.message.includes("fetch")) {
        alert(
          "Erreur de connexion. Vérifiez votre connexion internet ou réessayez plus tard."
        );
      } else {
        alert(`Erreur: ${error.message}`);
      }
    } finally {
      // Restaurer le bouton
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("animate");

      // Special handling for contact items
      if (entry.target.classList.contains("contact-info")) {
        const contactItems = entry.target.querySelectorAll(".contact-item");
        contactItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("animate");
          }, index * 100);
        });
      }
    }
  });
}, observerOptions);

// Observe all animated elements
document
  .querySelectorAll(
    ".service-card, .product-card, .about-text, .about-image, .contact-form, .contact-info"
  )
  .forEach((element) => {
    observer.observe(element);
  });

// Add typing animation to hero title
const heroTitle = document.querySelector(".hero h1");
if (heroTitle) {
  const titleText = heroTitle.textContent;
  heroTitle.textContent = "";

  let i = 0;
  const typeWriter = () => {
    if (i < titleText.length) {
      heroTitle.textContent += titleText.charAt(i);
      i++;
      setTimeout(typeWriter, 100);
    }
  };

  // Start typing animation after page load
  window.addEventListener("load", () => {
    setTimeout(typeWriter, 500);
  });
}

// Add floating animation to CTA button
const ctaButton = document.querySelector(".cta-button");
if (ctaButton) {
  ctaButton.addEventListener("mouseenter", () => {
    ctaButton.style.animation = "float 1s ease-in-out infinite";
  });

  ctaButton.addEventListener("mouseleave", () => {
    ctaButton.style.animation = "none";
  });
}

// Add parallax effect to hero background
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector(".hero");
  const rate = scrolled * -0.5;

  if (hero) {
    hero.style.transform = `translateY(${rate}px)`;
  }
});

// Header scroll effect
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (header) {
    if (window.scrollY > 100) {
      header.style.background = "rgba(200, 90, 158, 0.95)";
    } else {
      header.style.background =
        "linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-gray) 100%)";
    }
  }
});
