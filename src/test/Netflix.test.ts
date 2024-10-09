import Netflix from '../model/Netflix';
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

describe('Netflix', () => {
    const mockDatabase = new DatabaseModel().pool;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listarNetflixTitles', () => {
        it('deve retornar uma lista de títulos da Netflix em caso de sucesso', async () => {
            const mockResult = {
                rows: [
                    {
                        show_id: '1',
                        title: 'Título 1',
                        type: 'Movie',
                        release_year: 2020,
                    },
                ],
            };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockResult); // Definindo o comportamento esperado

            const result = await Netflix.listarNetflixTitles();
            expect(result).toEqual(mockResult.rows);
            expect(mockDatabase.query).toHaveBeenCalledWith('SELECT * FROM netflix_titles;');
        });

        it('deve retornar uma mensagem de erro em caso de falha', async () => {
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await Netflix.listarNetflixTitles();
            expect(result).toBe('error, verifique os logs do servidor');
        });
    });

    describe('removerNetflixTitle', () => {
        it('deve retornar true quando o título da Netflix for removido com sucesso', async () => {
            const mockDeleteResult = { rowCount: 1 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult); // Mock de resultado de sucesso

            const result = await Netflix.removerNetflixTitle('1');
            expect(result).toBe(true);
            expect(mockDatabase.query).toHaveBeenCalledWith("DELETE FROM netflix_titles WHERE show_id='1'");
        });

        it('deve retornar false quando não houver título para remover', async () => {
            const mockDeleteResult = { rowCount: 0 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult); // Mock de resultado quando não existe título

            const result = await Netflix.removerNetflixTitle('2');
            expect(result).toBe(false);
            expect(mockDatabase.query).toHaveBeenCalledWith("DELETE FROM netflix_titles WHERE show_id='2'");
        });

        it('deve retornar false e capturar erro em caso de falha', async () => {
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Delete error'));

            const result = await Netflix.removerNetflixTitle('1');
            expect(result).toBe(false);
            expect(mockDatabase.query).toHaveBeenCalledWith("DELETE FROM netflix_titles WHERE show_id='1'");
        });
    });
});
