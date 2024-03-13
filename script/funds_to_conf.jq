[
  .fund
  | sort_by(.name)
  | .[]
  | select(.status.value == "ACTIVE")
  | [.code, .name]
]
