import express from 'express';
import cors from 'cors';
import volleyball from 'volleyball';
import helmet from 'helmet';
import CacheNow from 'cachenow';
import { File } from '@google-cloud/storage/build/src/file';

import { storage } from './lib/firebase';

const app = express();
const fileCache = new CacheNow<File>(15 * 60 * 1000);

app.use(cors());
app.use(volleyball);
app.use(helmet());

app.get('**', async (req, res) => {
  try {
    if (req.originalUrl === '/') 
      throw new Error();

    const path = req.originalUrl.slice(1);
    const inCache = fileCache.get(path) !== null;
    const file = inCache
      ? fileCache.get(path) as File
      : (await storage
        .file(path)
        .get())[0];

    if (!file)
        throw new Error();

    if (!inCache)
        fileCache.set(path, file);

    res.writeHead(200, {
      'Content-Type': file.metadata.contentType,
      'Content-Length': file.metadata.size,
    });
    file
      .createReadStream()
      .pipe(res);
  } catch (e) {    
    res
      .status(404)
      .json({ message: 'Ressource not found', status: 404 });
  }
});


export default app;