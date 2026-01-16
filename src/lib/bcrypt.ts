import bcrypt from 'bcrypt'

const saltRounds = 10;


export const generateHash = async (password: string) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt)
    return hash
}

export const passwordCheck = async (password: string, hash: string) => {
    const compare = await bcrypt.compare(password, hash)
    return compare
}
