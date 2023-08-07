let score = 0;
let answersCounter = 0;

const modal = document.getElementById("myModal");
const closeButton = document.querySelector(".close");

closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

function checkAnswer(answer) {
  if (answer.getAttribute("data-correct-answer") != null) {
    document.getElementsByClassName("question")[
      answer.getAttribute("data-question-number")
    ].style.background = "#7A9D54";
    score++;
  } else {
    document.getElementsByClassName("question")[
      answer.getAttribute("data-question-number")
    ].style.background = "#FF6666";
  }

  document.querySelector(
    `[data-correct-answer="${answer.getAttribute("data-question-number")}"]`
  ).style.background = "#A2FF86";

  for (let i = 0; i < 4; i++) {
    document.getElementsByClassName(
      "answer" + answer.getAttribute("data-question-number")
    )[i].onclick = function () {};
    document
      .getElementsByClassName(
        "answer" + answer.getAttribute("data-question-number")
      )
      [i].classList.remove("answer-hover");
  }
  let soundNumber = document.getElementById(
    "soundNr" + answer.getAttribute("data-question-number")
  );
  console.log(soundNumber);
  soundNumber.pause();
  answersCounter++;

  if (answersCounter === 10) {
    document.getElementById("score").innerText =
      "Your final score is " + score + ".";
    modal.style.display = "flex";
  }
}
