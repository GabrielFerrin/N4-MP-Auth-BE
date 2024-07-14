const notImplemented = (req, res, next) => {
  const message = 'La ruta no está implementada'
  res.status(404).json({ sucess: false, message })
}

export default notImplemented
