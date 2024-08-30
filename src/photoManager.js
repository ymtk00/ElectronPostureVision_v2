const fs = require('fs').promises;
const path = require('path');
const db = require('./database');

class PhotoManager {
  constructor() {
    this.uploadDir = path.join(__dirname, 'uploads');
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
  }

  async savePhoto(name, file) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(this.uploadDir, fileName);
    
    try {
      await fs.writeFile(filePath, file.data);
      const result = await db.run('INSERT INTO photos (name, url) VALUES (?, ?)', [name, filePath]);
      return { id: result.id, name, url: filePath };
    } catch (error) {
      console.error('Error saving photo:', error);
      throw error;
    }
  }

  async getPhotos() {
    return await db.all('SELECT * FROM photos');
  }

  async getPhotoById(id) {
    const photo = await db.all('SELECT * FROM photos WHERE id = ?', [id]);
    return photo[0];
  }

  async updatePhoto(id, name, file) {
    const oldPhoto = await this.getPhotoById(id);
    let filePath = oldPhoto.url;

    if (file) {
      await fs.unlink(oldPhoto.url);
      const fileName = `${Date.now()}-${file.name}`;
      filePath = path.join(this.uploadDir, fileName);
      await fs.writeFile(filePath, file.data);
    }

    await db.run('UPDATE photos SET name = ?, url = ? WHERE id = ?', [name, filePath, id]);
    return { id, name, url: filePath };
  }

  async deletePhoto(id) {
    const photo = await this.getPhotoById(id);
    await fs.unlink(photo.url);
    return await db.run('DELETE FROM photos WHERE id = ?', [id]);
  }
}

module.exports = PhotoManager;