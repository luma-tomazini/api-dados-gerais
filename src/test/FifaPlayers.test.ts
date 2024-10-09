import FifaPlayers from '../model/FifaPlayers';
import { DatabaseModel } from '../model/DatabaseModel';

// Jest.mock para o DatabaseModel
jest.mock('../model/DatabaseModel', () => {
    const mockQuery = jest.fn(); // Mock da função query
    return {
        DatabaseModel: jest.fn().mockImplementation(() => ({
            pool: {
                query: mockQuery, // Atribuindo o mockQuery à função query
            },
        })),
        mockQuery, // Exportar o mockQuery para ser usado nos testes
    };
});

describe('FifaPlayers', () => {
    const mockDatabase = new DatabaseModel().pool;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listarPlayersCards', () => {
        it('deve retornar uma lista de cards de jogadores em caso de sucesso', async () => {
            const mockResult = {
                rows: [
                    {
                        playerid: 1,
                        nome: 'Jogador 1',
                        time: 'Time A',
                        rating: 85,
                    },
                ],
            };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockResult); // Definindo o comportamento esperado

            const result = await FifaPlayers.listarPlayersCards();
            expect(result).toEqual(mockResult.rows);
        });

        it('deve retornar uma mensagem de erro em caso de falha', async () => {
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await FifaPlayers.listarPlayersCards();
            expect(result).toBe('error, verifique os logs do servidor');
        });
    });

    describe('removerPlayerCard', () => {
        it('deve retornar true quando o card do jogador for removido com sucesso', async () => {
            const mockDeleteResult = { rowCount: 1 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult); // Mock de resultado de sucesso

            const result = await FifaPlayers.removerPlayerCard(1);
            expect(result).toBe(true);
        });

        it('deve retornar false quando não houver card para remover', async () => {
            const mockDeleteResult = { rowCount: 0 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult); // Mock de resultado quando não existe card

            const result = await FifaPlayers.removerPlayerCard(2);
            expect(result).toBe(false);
        });

        it('deve retornar false e capturar erro em caso de falha', async () => {
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Delete error'));

            const result = await FifaPlayers.removerPlayerCard(1);
            expect(result).toBe(false);
        });
    });
});
