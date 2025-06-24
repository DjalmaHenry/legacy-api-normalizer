import { RawOrderLine } from '../models/order.model';
import { ExtractedFields } from './parser.model';

export interface IOrderParser {
  parseLine(line: string): RawOrderLine;
  parseFile(content: string): RawOrderLine[];
}

export interface IOrderParserStatic {
  parseLine(line: string): RawOrderLine;
  parseFile(content: string): RawOrderLine[];
}

export interface IFieldValidator {
  validateFields(fields: ExtractedFields): void;
  validateLineLength(line: string): void;
}
