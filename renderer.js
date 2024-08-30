document.addEventListener('DOMContentLoaded', () => {
    const photoForm = document.getElementById('photo-form');
    const photoName = document.getElementById('photo-name');
    const photoFile = document.getElementById('photo-file');
    const saveButton = document.getElementById('save-photo');
    const photoList = document.getElementById('photo-list');
  
    let editingPhotoId = null;
  
    saveButton.addEventListener('click', async () => {
      const name = photoName.value;
      const file = photoFile.files[0];
  
      if (!name || !file) {
        alert('Please enter a name and select a file.');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = {
          name: file.name,
          type: file.type,
          data: new Uint8Array(e.target.result)
        };
  
        if (editingPhotoId) {
          await window.electronAPI.updatePhoto(editingPhotoId, name, fileData);
          editingPhotoId = null;
          saveButton.textContent = 'Save Photo';
        } else {
          await window.electronAPI.savePhoto(name, fileData);
        }
  
        photoName.value = '';
        photoFile.value = '';
        refreshPhotoList();
      };
      reader.readAsArrayBuffer(file);
    });
  
    async function refreshPhotoList() {
      const photos = await window.electronAPI.getPhotos();
      photoList.innerHTML = '';
  
      photos.forEach(photo => {
        const photoElement = document.createElement('div');
        photoElement.className = 'photo-item';
        photoElement.innerHTML = `
          <img src="file://${photo.url}" alt="${photo.name}" style="width: 100px; height: 100px; object-fit: cover;">
          <p>${photo.name}</p>
          <button class="edit-photo" data-id="${photo.id}">Edit</button>
          <button class="delete-photo" data-id="${photo.id}">Delete</button>
        `;
        photoList.appendChild(photoElement);
      });
  
      // Add event listeners for edit and delete buttons
      document.querySelectorAll('.edit-photo').forEach(button => {
        button.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          const photo = photos.find(p => p.id === parseInt(id));
          photoName.value = photo.name;
          editingPhotoId = photo.id;
          saveButton.textContent = 'Update Photo';
        });
      });
  
      document.querySelectorAll('.delete-photo').forEach(button => {
        button.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          await window.electronAPI.deletePhoto(parseInt(id));
          refreshPhotoList();
        });
      });
    }
  
    refreshPhotoList();
  });