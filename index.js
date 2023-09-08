'use strict'

const express = require('express')
const { v5: uuidv5 } = require('uuid')
const jwt = require('jsonwebtoken')

const Namespace = '399bab1d-a577-492f-87d7-185963046df4'
const app = express()

console.log(typeof uuidv5("atenantName", Namespace))

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
    email: decodedToken.email,
    firstName: decodedToken.given_name,
    lastName: decodedToken.family_name
  }

  if (decodedToken.realm_access.roles.includes(`${tenantName}-admin`)) {
    response.tenantName = tenantName
    response.tenantId = { 
      id: uuidv5(tenantName, Namespace),
      entityType: "TENANT"
    }
  } else if (decodedToken.realm_access.roles.includes(`${tenantName}-user`)) {
    response.customerName = 'user'
    response.customerId = { 
      id: uuidv5(tenantName, Namespace),
      entityType: "TENANT"
    }
  } else {
    return res.status(403).send('Missing Role')
  }

  res.status(200).json(response)
})

app.listen(3000)
