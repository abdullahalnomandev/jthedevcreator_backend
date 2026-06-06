import fs from 'fs';
import path from 'path';

const unlinkFile = (file: string) => {
  const filePath = path.join('uploads', file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  } else if ( !filePath ) {
    console.log( "File was not exist on this path!")
  }
};

export default unlinkFile;
