import { RawOrderLine } from '../models/order.model';

export interface IOrderParser {
  parseLine(line: string): RawOrderLine;
  parseFile(content: string): RawOrderLine[];
}

export interface IOrderParserStatic {
  parseLine(line: string): RawOrderLine;
  parseFile(content: string): RawOrderLine[];
}