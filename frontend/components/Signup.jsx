import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Form from './styles/Form'
import Error from './ErrorMessage'

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signUp(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`

class Signup extends Component {
  state = {
    email: '',
    name: '',
    password: '',
  }

  saveToState = event => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  }

  render() {
    return (
      <Mutation mutation={SIGNUP_MUTATION} variables={this.state}>
        {(signUp, { loading, error }) => {
          return (
            <Form
              method='post'
              onSubmit={async e => {
                e.preventDefault()
                const res = await signUp()
                this.setState({ name: '', email: '', password: '' })
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Sign up here</h2>
                <Error error={error} />
                <label htmlFor='email'>
                  Email
                  <input
                    type='email'
                    name='email'
                    id='email'
                    placeholder='email...'
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor='name'>
                  Name
                  <input
                    type='text'
                    name='name'
                    id='name'
                    placeholder='name...'
                    value={this.state.name}
                    onChange={this.saveToState}
                  />
                </label>
                <label htmlFor='password'>
                  Password
                  <input
                    type='password'
                    name='password'
                    id='password'
                    placeholder='password...'
                    value={this.state.password}
                    onChange={this.saveToState}
                  />
                </label>

                <button type='submit'>Sign Up!</button>
              </fieldset>
            </Form>
          )
        }}
      </Mutation>
    )
  }
}

export default Signup
