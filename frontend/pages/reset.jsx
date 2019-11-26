import React from 'react'
import Reset from '../components/Reset'

const ResetPage = props => (
  <div>
    <Reset props={props.query.resetToken}/>
  </div>
)

export default ResetPage
