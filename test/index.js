
window.a = 0;

const justBecause = () => {
  window.a++;
};

const addNewElement = () => {
  const newElement = document.createElement("div");

  const currentTime = new Date();
  const timeText = currentTime.toLocaleTimeString();

  newElement.textContent = 'Inserted at: ' + timeText;

  document.getElementById('times').appendChild(newElement);
}

const boot = () => {
  addNewElement();
  setInterval(addNewElement, 10000);
  setInterval(justBecause, 1000);
};

window.addEventListener('load', boot);
