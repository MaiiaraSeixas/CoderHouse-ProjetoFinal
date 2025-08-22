import { expect } from 'chai';
import sinon from 'sinon';
import { TicketDAO } from '../daos/mongo/ticket.dao.js';
import { TicketModel } from '../models/ticket.model.js';

describe('Teste de Unidade para TicketDAO', () => {
  let ticketDAO;

  beforeEach(() => {
    ticketDAO = new TicketDAO();
    sinon.restore();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Deve encontrar um ticket pelo ID', async () => {
    const ticketId = 'some-ticket-id';
    const ticketMock = { _id: ticketId, code: '123' };

    const findByIdStub = sinon.stub(TicketModel, 'findById').returns({
      lean: sinon.stub().resolves(ticketMock)
    });

    const result = await ticketDAO.findTicketById(ticketId);

    expect(result).to.deep.equal(ticketMock);
    expect(findByIdStub.calledOnceWith(ticketId)).to.be.true;
  });

  it('Deve encontrar um ticket pelo código', async () => {
    const ticketCode = '123';
    const ticketMock = { _id: 'some-ticket-id', code: ticketCode };

    const findOneStub = sinon.stub(TicketModel, 'findOne').returns({
      lean: sinon.stub().resolves(ticketMock)
    });

    const result = await ticketDAO.findTicketByCode(ticketCode);

    expect(result).to.deep.equal(ticketMock);
    expect(findOneStub.calledOnceWith({ code: ticketCode })).to.be.true;
  });

  it('Deve criar um novo ticket', async () => {
    const ticketData = { code: '123', amount: 100 };
    const createdTicketMock = { _id: 'new-id', ...ticketData };

    sinon.stub(TicketModel.prototype, 'save').resolves(createdTicketMock);

    const result = await ticketDAO.createTicket(ticketData);

    expect(result).to.deep.equal(createdTicketMock);
  });

  it('Deve atualizar um ticket existente', async () => {
    const ticketId = 'some-ticket-id';
    const ticketData = { amount: 200 };
    const updatedTicketMock = { _id: ticketId, ...ticketData };

    const findByIdAndUpdateStub = sinon.stub(TicketModel, 'findByIdAndUpdate').returns({
      lean: sinon.stub().resolves(updatedTicketMock)
    });

    const result = await ticketDAO.updateTicket(ticketId, ticketData);

    expect(result).to.deep.equal(updatedTicketMock);
    expect(findByIdAndUpdateStub.calledOnceWith(ticketId, ticketData, { new: true })).to.be.true;
  });

  it('Deve deletar um ticket', async () => {
    const ticketId = 'some-ticket-id';
    const deleteResultMock = { acknowledged: true, deletedCount: 1 };

    const findByIdAndDeleteStub = sinon.stub(TicketModel, 'findByIdAndDelete').resolves(deleteResultMock);

    const result = await ticketDAO.deleteTicket(ticketId);

    expect(result).to.deep.equal(deleteResultMock);
    expect(findByIdAndDeleteStub.calledOnceWith(ticketId)).to.be.true;
  });
});
