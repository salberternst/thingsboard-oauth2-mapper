'use strict'

const express = require('express')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// create a unique hash for an email + role
function createEmail (email, tenantName, role) {
  const hash = crypto
    .createHash('shake256', { outputLength: 8 })
    .update(`${role}-${tenantName}-${email}`)
    .digest('hex')
  return `${hash}@thingsboard.local`
}

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
    lastName: decodedToken.family_name,
    email: decodedToken.email
  }

  if (decodedToken.realm_access.roles.includes('admin')) {
    response.tenantName = tenantName
    response.email = createEmail(decodedToken.email, tenantName, 'admin')
  } else if (decodedToken.realm_access.roles.includes('customer')) {
    response.customerId = decodedToken.customer_id
    response.email = createEmail(
      decodedToken.email,
      tenantName,
      decodedToken.customer_id
    )
  } else {
    return res.status(403).send('Missing Role')
  }

  res.status(200).json(response)
})

app.listen(3000)
