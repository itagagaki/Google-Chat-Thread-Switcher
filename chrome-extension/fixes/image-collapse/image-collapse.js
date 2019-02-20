// still need to save images that have been hidden, and hide them on room change / load
// name class selectors
const createButton = () => {
  const hideButton = document.createElement('button')
  hideButton.textContent = 'hide image'
  hideButton.onclick = (event) => {
    const imageToHide = event.target.parentElement.querySelector('.av5rYd')
    imageToHide.style.display = "none"
  }
  return hideButton
}

const addHideImageButtons = () => {
  const images = document.getElementsByClassName('V5MAMb')
  Array.from(images)
    .forEach(image => {
      const imageHideButton = createButton()
      image.parentElement.parentElement.appendChild(imageHideButton);
    })
}

export default addHideImageButtons
