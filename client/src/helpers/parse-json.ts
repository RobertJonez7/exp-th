export const parseJSON = (json: string) => {
    let parsed

    try {
        parsed = JSON.parse(json)
    } catch (error) {
        console.error("Unable to parse JSON string", error)
    }

    return parsed
}