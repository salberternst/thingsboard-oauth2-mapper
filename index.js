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

  const tenantName = decodedToken.tenant_id
  if (tenantName === undefined) {
    return res.status(400).send('Bad Request')
  }

  if (decodedToken.realm_access.roles.includes('admin')) {
    response.tenantName = tenantName
    response.email = decodedToken.email
  } else if (
    decodedToken.realm_access.roles.includes('customer') &&
    decodedToken.customer_id !== undefined
  ) {
    response.customerId = {
      id: decodedToken.customer_id,
      entityType: 'CUSTOMER'
    }
    response.email = decodedToken.email
  } else {
    return res.status(403).send('Missing Role')
  }

  res.status(200).json(response)
})

app.listen(3000)
