// src/dtos/ticket.dto.js

export default class TicketDTO {
  constructor(ticket) {
    this.code = ticket.code;
    this.amount = ticket.amount;
    this.purchase_datetime = ticket.purchase_datetime;
    this.purchaser = ticket.purchaser;
  }
}
