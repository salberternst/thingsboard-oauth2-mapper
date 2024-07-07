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
  if (token === undefined) {
    return res.status(400).send('Bad Request')
  }

  const decodedToken = jwt.decode(token)
  const response = {
    firstName: decodedToken.given_name,
    lastName: decodedToken.family_name,
    email: decodedToken.email
  }

  const tenantId = decodedToken.thingsboard_tenant_id
  if (tenantId === undefined) {
    return res.status(400).send('Bad Request')
  }

  response.tenantId = {
    id: tenantId,
    entityType: 'TENANT'
  }

  if (
    decodedToken.realm_access.roles.includes('admin') ||
    decodedToken.realm_access.roles.includes('sysadmin')
  ) {
    res.status(200).json(response)
  } else if (
    decodedToken.realm_access.roles.includes('customer') &&
    decodedToken.customer_id !== undefined
  ) {
    response.customerId = {
      id: decodedToken.customer_id,
      entityType: 'CUSTOMER'
    }
  } else {
    return res.status(403).send('Missing Role')
  }

  res.status(200).json(response)
})

app.listen(3000)
