[
  .row
  | sort_by(.description)
  | .[]
  | select(.enabled)
  | [.code, .description]
]
