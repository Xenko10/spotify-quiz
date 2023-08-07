let score = 0;
let answersCounter = 0;
function checkAnswer(answer) {
  if (answer.getAttribute("data-correct-answer") != null) {
    document.getElementsByClassName("question")[
      answer.getAttribute("data-question-number")
    ].style.background = "#7A9D54";
    score++;
  } else {
    document.getElementsByClassName("question")[
      answer.getAttribute("data-question-number")
    ].style.background = "#D71313";
  }
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
    document.getElementById("scoreDiv").innerText =
      "Your score is " + score + " points.";
  }
}
