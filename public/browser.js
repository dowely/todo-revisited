const form = document.getElementById('user-form')
const input = document.getElementById('input-field')
const list = document.getElementById('item-list')

function listItemTemplate(item) {
  return `
  <li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
  <span data-id="${item._id}" class="item-text">${item.text}</span>
  <div>
    <button class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
    <button class="delete-me btn btn-danger btn-sm">Delete</button>
  </div>
</li>
  `
}

let ourHTML = items.map(item => {
  return listItemTemplate(item)
}).join('')

list.insertAdjacentHTML('beforeend', ourHTML)

form.addEventListener('submit', (e) => {
  e.preventDefault()
  axios.post('/create-item', {text: input.value}).then(response => {
    list.insertAdjacentHTML('beforeend', listItemTemplate(response.data))
    input.value = ''
    input.focus()
  }).catch(() => console.log('try again later'))
})

document.addEventListener('click', e => {

  //delete feature
  if(e.target.classList.contains('delete-me')) {
    if(confirm('Do you really want to delete this item permanently?')) {
      axios.post('delete-item', {id: e.target.parentElement.parentElement.querySelector('.item-text').getAttribute('data-id')}).then((res) => {
        e.target.parentElement.parentElement.remove()
        console.log(res)
      }).catch(() => console.log('try again later'))
    }
  }
  
  // update feature
  if(e.target.classList.contains('edit-me')) {
    let userInput = prompt('Enter updated text:', e.target.parentElement.parentElement.querySelector('.item-text').textContent)
    if(userInput) {
      axios.post('update-item', {text: userInput, id: e.target.parentElement.parentElement.querySelector('.item-text').getAttribute('data-id')}).then(() => {
        e.target.parentElement.parentElement.querySelector('.item-text').textContent = userInput
      }).catch(() => console.log('try again later'))
    }
  } 
})