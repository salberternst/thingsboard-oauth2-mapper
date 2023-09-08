'use strict'

const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  return res.status(200).send('OK')
})

app.post('/', (req, res) => {
  const token = req.headers['provider-access-token']
  const tenantName = req.headers['x-tenant-name']

  if (token === undefined || tenantName === undefined) {
    return res.status(400).send('Bad Request')
  }

  const decodedToken = jwt.decode(token)
  const response = {
    firstName: decodedToken.given_name,
    lastName: decodedToken.family_name
  }

  if (decodedToken.realm_access.roles.includes(`${tenantName}-admin`)) {
    response.tenantName = tenantName
    response.email = `admin-${tenantName}-${decodedToken.email}`
  } else if (decodedToken.realm_access.roles.includes(`${tenantName}-user`)) {
    response.customerName = 'user'
    esponse.email = `user-${tenantName}-${decodedToken.email}`
  } else {
    return res.status(403).send('Missing Role')
  }

  res.status(200).json(response)
})

app.listen(3000)
