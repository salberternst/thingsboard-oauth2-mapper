'use strict'

const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()

app.use(express.json())

app.post('/', (req, res, next) => {
  const token = req.headers['provider-access-token']
  const tenantName = req.headers['x-tenant-name']

  if (token === undefined || tenantName === undefined) {
    return res.status(400).send('Bad Request')
  }

  const decodedToken = jwt.decode(token)
  const response = {
    email: decodedToken.email,
    firstName: decodedToken.given_name,
    lastName: decodedToken.family_name
  }

  if (decodedToken.realm_access.roles.includes(`${tenantName}-admin`)) {
    response.tenantName = tenantName
  } else if (decodedToken.realm_access.roles.includes(`${tenantName}-user`)) {
    response.customerName = 'user'
  } else {
    return res.status(403).send('Missing Role')
  }

  res.status(200).json(response)
})

app.listen(3000)
