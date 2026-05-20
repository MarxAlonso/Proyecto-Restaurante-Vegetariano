import { IncomingMessage, ServerResponse } from 'http';
import app from '../src/index';

export default function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  return app(req, res);
}