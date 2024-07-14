const error = (err, req, res, next) => {
  const message = err.message || 'Internal Server Error'
  res.status(500).json({ success: false, message, error: err.message })
}

export default error
