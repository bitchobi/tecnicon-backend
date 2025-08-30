import bcrypt from 'bcrypt';

const generarHashes = async () => {
  const hashAdmin = await bcrypt.hash('123456', 10);
  const hashJuan = await bcrypt.hash('123456', 10);
  const hashCarlos = await bcrypt.hash('123456', 10);

  console.log({
    hashAdmin,
    hashJuan,
    hashCarlos
  });
};

generarHashes();
