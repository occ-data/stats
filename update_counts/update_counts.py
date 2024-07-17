import json

import requests


def read_instances_file():
    """
    Converts the javascript object to JSON and then to a python dict
    """
    with open("./src/js/instances.js") as f:
        contents = f.read()
    # remove javascript variable initialization
    json_contents = "{" + "{".join(contents.split("{")[1:])
    return json.loads(json_contents)


def write_instances_file(instances):
    """
    Converts the python dict back to javascript and overwrites the file
    """
    contents = f"const instances = {json.dumps(instances, indent=4)}"
    with open("./src/js/instances.js", "w") as f:
        f.write(contents)


def get_total_subject_count(instance_name, subjects):
    subj_count = 0
    if instance_name == "kf":
        return subjects["samples"]
    elif instance_name == "crdc":
        return int(subjects["data"]["aggregations"]["summary.case_count"]["stats"]["sum"])
    else:
        for project_subjects_count in subjects.values():
            for count in project_subjects_count.values():
                subj_count += count
        return subj_count


def main():
    instances = read_instances_file()
    err_msg = "  ERROR: Unable to update counts for instance '{}' at {}; moving on to the next instance. Details: {}"

    for instance_name, values in instances.items():
        print(f"INFO: Updating counts for instance '{instance_name}'")
        if "file_stats_endpoint" in values:
            url = values["file_stats_endpoint"]
            try:
                resp = requests.get(url)
            except Exception as e:
                print(err_msg.format(instance_name, url, e))
                continue
            if resp.status_code == 200:
                data = resp.json()
                instances[instance_name]["file_count"] = data["fileCount"]
                instances[instance_name]["total_file_size"] = data["totalFileSize"]
            else:
                print(err_msg.format(instance_name, url, f"status code {resp.status_code} - {resp.text}"))
        else:
            print(f"  INFO: Not updating file counts for instance '{instance_name}' because 'file_stats_endpoint' is not configured")

        if "subject_stats_endpoint" in values:
            url = values["subject_stats_endpoint"]
            try:
                resp = requests.get(url)
            except Exception as e:
                print(err_msg.format(instance_name, url, e))
                continue
            if resp.status_code == 200:
                instances[instance_name]["subject_count"] = get_total_subject_count(instance_name, resp.json())
            else:
                print(err_msg.format(instance_name, url, f"status code {resp.status_code} - {resp.text}"))
        else:
            print(f"  INFO: Not updating subject count for instance '{instance_name}' because 'subject_stats_endpoint' is not configured")

    write_instances_file(instances)


if __name__ == "__main__":
    main()
