package spartan.sdd

default allow = true

deny[msg] {
  is_production_deploy
  not has_stage("sdd_gate")
  msg := "Production deployment pipelines must include an SDD gate stage."
}

deny[msg] {
  is_production_deploy
  not has_security_scan
  msg := "Production deployment pipelines must include a security scan stage or step."
}

deny[msg] {
  is_production_deploy
  not has_approval
  msg := "Production deployment pipelines must include manual approval before deploy."
}

deny[msg] {
  is_production_deploy
  score := object.get(input, "sdd_score", 100)
  score < 85
  msg := sprintf("Production deployment blocked because SDD score is %v; required minimum is 85.", [score])
}

deny[msg] {
  is_critical_pipeline
  not is_remote_pipeline
  msg := "Critical Spartan pipelines must be stored through Harness Git Experience."
}

has_stage(identifier) {
  stage := input.pipeline.stages[_].stage
  lower(stage.identifier) == identifier
}

has_security_scan {
  stage := input.pipeline.stages[_].stage
  contains(lower(stage.identifier), "security")
}

has_security_scan {
  step := input.pipeline.stages[_].stage.spec.execution.steps[_].step
  contains(lower(step.identifier), "secret")
}

has_security_scan {
  step := input.pipeline.stages[_].stage.spec.execution.steps[_].step
  contains(lower(step.identifier), "sto")
}

has_approval {
  input.pipeline.stages[_].stage.type == "Approval"
}

has_approval {
  step := input.pipeline.stages[_].stage.spec.execution.steps[_].step
  step.type == "HarnessApproval"
}

is_production_deploy {
  stage := input.pipeline.stages[_].stage
  stage.type == "Deployment"
  contains(lower(sprintf("%v", [stage])), "prod")
}

is_critical_pipeline {
  tags := object.get(input.pipeline, "tags", {})
  object.get(tags, "sdd", "false") == "true"
}

is_remote_pipeline {
  object.get(input.pipeline, "storeType", "") == "REMOTE"
}

is_remote_pipeline {
  object.get(input.pipeline, "yamlPath", "") != ""
}
