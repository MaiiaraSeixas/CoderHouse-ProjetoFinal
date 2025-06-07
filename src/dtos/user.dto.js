// src/dtos/user.dto.js

export default class UserDTO {
  constructor(user) {
    this.name = `${user.first_name} ${user.last_name}`.trim();
    this.email = user.email;
    this.role = user.role;
  }
}
