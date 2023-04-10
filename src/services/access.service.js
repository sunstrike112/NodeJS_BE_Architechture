'use strict'

const shopModel = require("../models/shop.model")
const bycrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require('../auth/authUtils')
const { getInfoData } = require("../utils")


const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN'
}

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // Step 1: Check email exist ?
      const holderShop = await shopModel.findOne({ email }).lean()
      console.log(holderShop)
      if (holderShop) {
        return {
          code: 'xxx',
          message: 'Shop already registed !!!'
        }
      }
      const passwordHash = await bycrypt.hash(password, 10)
      const newShop = await shopModel.create({
        name, email, password: passwordHash, roles: [RoleShop.SHOP]
      })

      if (newShop) {
        // Created PrivateKey, PublicKey
        // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem'
        //   },
        //   privateKeyEncoding: {
        //     type: 'pkcs1',
        //     format: 'pem'
        //   }
        // })
        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')
        console.log({ privateKey, publicKey })
        const keyStore = await KeyTokenService.createKeyToken({ 
          userId: newShop._id,
          publicKey,
          privateKey
        })

        if (!keyStore) {
          return {
            code: 'xxx',
            message: 'keyStore error'
          }
        }

        // Created token pair
        const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
        console.log(`Created Token Success::`, tokens)

        return {
          code: 201,
          metadata: {
            shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
            tokens
          }
        }
      }
    } catch (error) {
      console.log(error)
      return {
        code: 'xxx',
        message: error.message,
        status: 'error'
      }
    }
  }
}

module.exports = AccessService
