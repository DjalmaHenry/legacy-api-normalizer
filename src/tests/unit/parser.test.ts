import { OrderParser } from '../../utils/parser';

describe('OrderParser', () => {
  let parser: OrderParser;

  beforeEach(() => {
    parser = new OrderParser();
  });

  describe('parseLine', () => {
    it('deve analisar corretamente uma linha válida', () => {
      // Formato: USER_ID(10) + NAME(45) + ORDER_ID(10) + PRODUCT_ID(10) + VALUE(12) + DATE(8)
      const line = '0000000001João Silva                                   0000000001000000000100000123.45 20230101';
      
      const result = parser.parseLine(line);
      
      expect(result).toEqual({
        user_id: 1,
        name: 'João Silva',
        order_id: 1,
        product_id: 1,
        value: '123.45',
        date: '2023-01-01'
      });
    });

    it('deve lançar erro para linha com tamanho inválido', () => {
      const line = '0000000001João Silva';
      
      expect(() => parser.parseLine(line)).toThrow('Linha inválida: tamanho esperado');
    });

    it('deve lançar erro para campos numéricos inválidos', () => {
      const line = 'AAAAAAAABJoão Silva                                   BBBBBBBBBBCCCCCCCCCCaaaaa123.45 20230101';
      
      expect(() => parser.parseLine(line)).toThrow('Campos numéricos inválidos');
    });

    it('deve lançar erro para nome vazio', () => {
      const line = '0000000001                                           0000000001000000000100000123.45 20230101';
      
      expect(() => parser.parseLine(line)).toThrow('Nome do usuário não pode estar vazio');
    });
  });

  describe('parseFile', () => {
    it('deve analisar corretamente um arquivo com múltiplas linhas', () => {
      const content = [
        '0000000001João Silva                                  0000000001000000000100000123.45 20230101',
        '0000000001João Silva                                  0000000001000000000200000056.78 20230101',
        '0000000002Maria Souza                                0000000002000000000300000099.99 20230202'
      ].join('\n');
      
      const result = parser.parseFile(content);
      
      expect(result).toHaveLength(3);
      expect(result[0].user_id).toBe(1);
      expect(result[1].product_id).toBe(2);
      expect(result[2].name).toBe('Maria Souza');
    });

    it('deve ignorar linhas vazias', () => {
      const content = [
        '',
        '0000000001João Silva                                  0000000001000000000100000123.45 20230101',
        '',
        '0000000002Maria Souza                                0000000002000000000300000099.99 20230202',
        ''
      ].join('\n');
      
      const result = parser.parseFile(content);
      
      expect(result).toHaveLength(2);
    });

    it('deve lançar erro com número da linha quando uma linha é inválida', () => {
      const content = [
        '0000000001João Silva                                  0000000001000000000100000123.45 20230101',
        'linha inválida',
        '0000000002Maria Souza                                0000000002000000000300000099.99 20230202'
      ].join('\n');
      
      expect(() => parser.parseFile(content)).toThrow('Erro na linha 2:');
    });
  });
});