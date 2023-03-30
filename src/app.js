const compression = require('compression')
const express = require('express')
const { default: helmet } = require('helmet')
const morgan = require('morgan')

const app = express()

// Init middlewares
app.use(morgan('dev'))
app.use(helmet())
app.use(compression())

// Init DB

// Init routes
app.get('/', (req, res, next) => {
  const strCompress = 'Hello Fnfan'
  return res.status(200).json({
    message: 'Welcom FanTipJS',
    metadata: strCompress.repeat(10000)
  })
})

// Handling errror

module.exports = app