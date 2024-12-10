const inputs = document.querySelectorAll(".input-field");
const toggle_btn = document.querySelectorAll(".toggle");
const main = document.querySelector("main");
const bullets = document.querySelectorAll(".bullets span");
const images = document.querySelectorAll(".image");
const textSlider = document.querySelector(".text-group");

inputs.forEach((inp) => {
  inp.addEventListener("focus", () => {
    inp.classList.add("active");
  });
  inp.addEventListener("blur", () => {
    if (inp.value != "") return;
    inp.classList.remove("active");
  });
});

toggle_btn.forEach((btn) => {
  btn.addEventListener("click", () => {
    main.classList.toggle("sign-up-mode");
  });
});

let currentIndex = 0;

function moveSlider(index) {
  currentIndex = index;
  images.forEach((img) => img.classList.remove("show"));
  images[index].classList.add("show");

  textSlider.style.transform = `translateY(${-(index) * 2.2}rem)`;

  bullets.forEach((bull) => bull.classList.remove("active"));
  bullets[index].classList.add("active");
}

function autoSlide() {
  currentIndex = (currentIndex + 1) % images.length;
  moveSlider(currentIndex);
}

bullets.forEach((bullet, index) => {
  bullet.addEventListener("click", () => {
    clearInterval(sliderInterval);
    moveSlider(index);
    sliderInterval = setInterval(autoSlide, 5000);
  });
});

let sliderInterval = setInterval(autoSlide, 5000);
