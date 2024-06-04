window.onload = function () {
  const valueElements = document.querySelectorAll(".count");
  valueElements.forEach((element) => {
    const targetValue = parseInt(element.textContent);
    let currentValue = 0;
    const intervalId = setInterval(() => {
      currentValue++;
      element.textContent = currentValue;
      if (currentValue >= targetValue) {
        clearInterval(intervalId);
      }
    }, 20); // Adjust the interval for desired speed
  });
};

/* ========== COPY BUTTON ============== */
document.addEventListener("DOMContentLoaded", function () {
  const copyButtons = document.querySelectorAll(".copyBtn");

  copyButtons.forEach((button, index) => {
    button.addEventListener("click", function () {
      const codeBlock = document.querySelectorAll(".code-block")[index];
      const codeToCopy = codeBlock.textContent;

      navigator.clipboard.writeText(codeToCopy).catch(function (err) {
        console.error("Unable to copy text", err);
      });
    });
  });
});

/* ============ Progress Bar =========== */
document.addEventListener("scroll", function () {
  updateProgressBar();
});

function updateProgressBar() {
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  document.getElementById("myBar").style.width = scrolled + "%";
}

/*=============== CHANGE BACKGROUND HEADER ===============*/
const scrollHeader = () => {
  const header = document.getElementById("header");
  const text = document.querySelector(".nav__logo-text");
  const com = document.querySelector(".com-icon");
  const command = document.querySelector(".nav__com");

  const isSmall = window.innerWidth <= 320;

  // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
  if (this.scrollY >= 120) {
    header.classList.add("scroll-header");
    text.style.display = isSmall ? "none" : "inline-flex";
    com.style.display = "inline-flex";
    command.style.display = "none";
  } else {
    header.classList.remove("scroll-header");
    text.style.display = "none";
    com.style.display = "none";

    command.style.display = "inline-flex";
  }
};

window.addEventListener("scroll", scrollHeader);

/*=============== SWIPER POPULAR ===============*/
var swiperPopular = new Swiper(".popular__container", {
  spaceBetween: 32,
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: "auto",
  loop: true,

  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

/*=============== VALUE ACCORDION ===============*/
const accordionItems = document.querySelectorAll(".value__accordion-item");

accordionItems.forEach((item) => {
  const accordionHeader = item.querySelector(".value__accordion-header");
  accordionHeader.addEventListener("click", () => {
    const openItem = document.querySelector(".accordion-open");

    toggleItem(item);

    if (openItem && openItem !== item) {
      toggleItem(openItem);
    }
  });
});

const toggleItem = (item) => {
  const accordionContent = item.querySelector(".value__accordion-content");
  if (item.classList.contains("accordion-open")) {
    accordionContent.removeAttribute("style");
    item.classList.remove("accordion-open");
  } else {
    accordionContent.style.height = accordionContent.scrollHeight + "px";

    item.classList.add("accordion-open");
  }
};
/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll("section[id]");

const scrollActive = () => {
  const scrollDown = window.scrollY;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 58,
      sectionId = current.getAttribute("id"),
      sectionsClass = document.querySelector(".nav__menu a[href*=" + sectionId + "]");

    if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
      sectionsClass.classList.add("active-link");
    } else {
      sectionsClass.classList.remove("active-link");
    }
  });
};
window.addEventListener("scroll", scrollActive);

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
  const scrollUp = document.getElementById("scroll-up");
  // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
  this.scrollY >= 350 ? scrollUp.classList.add("show-scroll") : scrollUp.classList.remove("show-scroll");
};
window.addEventListener("scroll", scrollUp);

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const iconTheme = "bx-sun";

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () => (document.body.classList.contains(darkTheme) ? "dark" : "light");
const getCurrentIcon = () => (themeButton.classList.contains(iconTheme) ? "bx bx-moon" : "bx bx-sun");

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](darkTheme);
  themeButton.classList[selectedIcon === "bx bx-moon" ? "add" : "remove"](iconTheme);
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener("click", () => {
  // Add or remove the dark / icon theme
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);
  // We save the theme and the current icon that the user chose
  localStorage.setItem("selected-theme", getCurrentTheme());
  localStorage.setItem("selected-icon", getCurrentIcon());
});

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
  origin: "top",
  distance: "60px",
  duration: 2500,
  delay: 400,
  // reset: true
});
sr.reveal(`.home__title, .popular__container, .subscribe__container, .topgg__container`);
sr.reveal(`.footer__container`, { origin: "bottom" });
sr.reveal(`.footer__info`, { origin: "bottom", delay: 500 });
sr.reveal(`.home__description`, { delay: 500 });
sr.reveal(`.home__search`, { delay: 600 });
sr.reveal(`.home__value`, { delay: 700 });
sr.reveal(`.home__images`, { delay: 800, origin: "bottom" });
sr.reveal(`.logos__img`, { interval: 100 });
sr.reveal(`.value__images, .contact__content,`, { origin: "left" });
sr.reveal(`.value__content, .form, .toc-content, .times__data`, {
  origin: "right",
});

/* =========== Handle Contact Form Submission */
$(document).ready(function () {
  $("#contactForm").submit(function (event) {
    event.preventDefault();
    const formData = $(this).serialize();
    const token = window.authToken;
    $.ajax({
      type: "POST",
      url: "/submit",
      data: formData,
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      },
      success: function (response) {
        $("#contactForm")[0].reset();
        Swal.fire({
          icon: "success",
          title: "Submission Successful!",
          text: "We have received your message. Thank you!",
          confirmButtonColor: "#4CAF50",
          confirmButtonText: "OK",
        });
        $("#contactForm")[0].reset();
      },
      error: function (error) {
        // Show an error message using SweetAlert2
        console.log(error);
        $("#contactForm")[0].reset();
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: "There was an issue submitting your message. Please try again.",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK",
          showClass: {
            popup: "swal2-show",
            backdrop: "swal2-backdrop-show",
            icon: "swal2-icon-show",
          },
          hideClass: {
            popup: "swal2-hide",
            backdrop: "swal2-backdrop-hide",
            icon: "swal2-icon-hide",
          },
        });
      },
    });
  });
});

/* ========== For App ======== */
